import { writeFile } from 'fs'
import ts from 'typescript'
import { when } from './utils/conditionals'

// Base interface for all documentation items
export interface DocItem {
  kind: string
  name: string
  jsdoc?: JSDocInfo
}

// JSDoc information with description and tags
export interface JSDocInfo {
  description?: readonly string[]
  tags?: readonly JSDocTag[]
}

// JSDoc tags
export interface JSDocTag {
  tagName: string
  comment?: string
  name?: string
  type?: string
}

// Variable-specific data
export interface Variable extends DocItem {
  kind: 'Variable'
  typeAnnotation?: TypeAnnotation
}

// Function-specific data
export interface Function extends DocItem {
  kind: 'Function'
  parameters: readonly Parameter[]
  returnType: TypeAnnotation | undefined
}

// Parameter within functions and methods
export interface Parameter {
  name: string
  type?: TypeAnnotation
  jsdoc?: JSDocInfo
}

// Class-specific data
export interface Class extends DocItem {
  kind: 'Class'
  isAbstract: boolean
  extends?: string
  members: readonly ClassMember[]
}

// Class members can be properties, methods, or constructors
export interface ClassMember {
  kind: 'Property' | 'Method' | 'Constructor'
  name?: string
  accessModifier?: string
  jsdoc?: JSDocInfo
  typeAnnotation?: TypeAnnotation
  parameters?: readonly Parameter[]
}

// Enum-specific data
export interface Enum extends DocItem {
  kind: 'Enum'
  members: readonly EnumMember[]
}

// Enum members
export interface EnumMember {
  name: string
  jsdoc: JSDocInfo
}

// Type alias-specific data
export interface TypeAlias extends DocItem {
  kind: 'TypeAlias'
  typeAnnotation?: TypeAnnotation
}

export type Type = Variable | Function | Class | Enum | TypeAlias

// Type annotations can be primitive types, type references, type literals, or more complex types like unions or intersections
export type TypeAnnotation =
  | PrimitiveType
  | TypeReference
  | TypeLiteral
  | UnionOrIntersection
  | ComplexType

// Represents primitive types such as string, number, boolean
export interface PrimitiveType {
  kind: 'PrimitiveType'
  type: string
}

// Represents references to other types, possibly defined elsewhere
export interface TypeReference {
  kind: 'TypeReference'
  name: string
}

// Represents an object type literal
export interface TypeLiteral {
  kind: 'TypeLiteral'
  members: readonly TypeMember[]
}

// Members of a type literal
export interface TypeMember {
  name: string
  type?: TypeAnnotation
  jsdoc?: JSDocInfo
}

// Union or Intersection types
export interface UnionOrIntersection {
  kind: 'Union' | 'Intersection'
  types: readonly TypeAnnotation[]
}

// More complex types, possibly a recursive structure
export interface ComplexType {
  kind: 'ComplexType'
  details: string // Or more specific properties depending on the complexity
}

/**
 * Parses a TypeScript declaration file to extract various symbols and their documentation.
 * @param filePath - The path to the TypeScript file.
 * @returns The extracted data from the TypeScript file.
 */
function parseDeclarationFile(filePath: string) {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
  })
  const sourceFile = program.getSourceFile(filePath)
  if (!sourceFile) {
    console.error('File not found or could not be loaded.')
    return []
  }

  const checker = program.getTypeChecker()
  const extractedTypes: Type[] = []

  ts.forEachChild(sourceFile, node => {
    extractedTypes.push(...extractNode(node, checker))
  })

  return extractedTypes
}

/**
 * Dispatch function to handle different types of TypeScript nodes.
 * @param node - The current TypeScript node to process.
 * @param checker - The TypeScript type checker.
 * @returns An array of extracted data from the node.
 */
function extractNode(node: ts.Node, checker: ts.TypeChecker): Type[] {
  switch (node.kind) {
    case ts.SyntaxKind.VariableStatement:
      return extractVariables(node as ts.VariableStatement, checker)
    case ts.SyntaxKind.FunctionDeclaration:
      return [extractFunction(node as ts.FunctionDeclaration, checker)]
    case ts.SyntaxKind.ClassDeclaration:
      return [extractClass(node as ts.ClassDeclaration, checker)]
    case ts.SyntaxKind.EnumDeclaration:
      return [extractEnum(node as ts.EnumDeclaration)]
    case ts.SyntaxKind.TypeAliasDeclaration:
      return [extractTypeAlias(node as ts.TypeAliasDeclaration, checker)]
    default:
      return []
  }
}

/**
 * Extracts variable declarations from a variable statement.
 * @param statement - The variable statement node.
 * @param checker - The TypeScript type checker.
 * @returns An array of extracted variable data.
 */
function extractVariables(statement: ts.VariableStatement, checker: ts.TypeChecker): Variable[] {
  const jsdoc = extractJsDoc(statement)

  return statement.declarationList.declarations.map(declaration => {
    const result: Variable = {
      kind: 'Variable',
      name: declaration.name.getText(),
      jsdoc,
    }

    if (declaration.type) {
      result.typeAnnotation = extractType(declaration.type, checker, jsdoc?.tags)
    }

    return result
  })
}

/**
 * Extracts function declaration details.
 * @param func - The function declaration node.
 * @param checker - The TypeScript type checker.
 * @returns The extracted function data.
 */
function extractFunction(func: ts.FunctionDeclaration, checker: ts.TypeChecker): Function {
  const name = func.name ? func.name.getText() : 'anonymous'
  const result: Function = {
    kind: 'Function',
    name,
    parameters: func.parameters.map(param => extractParameter(param, checker)),
    returnType: func.type ? extractType(func.type, checker) : undefined,
  }
  when(extractJsDoc(func), jsdoc => (result.jsdoc = jsdoc))
  return result
}

/**
 * Extracts class declaration details, including properties and methods.
 * @param cls - The class declaration node.
 * @param checker - The TypeScript type checker.
 * @returns The extracted class data.
 */
function extractClass(cls: ts.ClassDeclaration, checker: ts.TypeChecker): Class {
  // Check for heritage clauses which indicate extension or implementation of other classes/interfaces
  const extendsClause = cls.heritageClauses?.find(
    clause => clause.token === ts.SyntaxKind.ExtendsKeyword,
  )
  let extendsName
  if (extendsClause && extendsClause.types.length > 0) {
    const typeNode = extendsClause.types[0]
    extendsName = typeNode.expression.getText()
  }

  // Check if the class is abstract
  const isAbstract = !!cls.modifiers?.some(
    modifier => modifier.kind === ts.SyntaxKind.AbstractKeyword,
  )

  const result: Class = {
    kind: 'Class',
    name: cls.name ? cls.name.getText() : 'anonymous',
    isAbstract,
    extends: extendsName,
    members: cls.members.map(member => extractClassMember(member, checker)).filter(Boolean),
  }

  when(extractJsDoc(cls), jsdoc => (result.jsdoc = jsdoc))

  return result
}

/**
 * Extracts individual class members such as properties and methods.
 * @param member - The class member to process.
 * @param checker - The TypeScript type checker.
 * @returns The extracted member data or null if the member type is not handled.
 */
function extractClassMember(member: ts.ClassElement, checker: ts.TypeChecker): ClassMember {
  const isPrivateField =
    ts.isPropertyDeclaration(member) && member.name.kind === ts.SyntaxKind.PrivateIdentifier

  if (isPrivateField) return null

  const name = member.name?.getText()
  const accessModifier = getAccessModifier(member)

  const result: ClassMember = {
    kind: ts.isPropertyDeclaration(member)
      ? 'Property'
      : ts.isMethodDeclaration(member)
      ? 'Method'
      : 'Constructor',
    name: name,
    accessModifier: accessModifier,

    typeAnnotation: extractType(member, checker),
    // 'type' in member && member.type
    //   ? checker.typeToString(checker.getTypeAtLocation(member.type))
    //   : undefined,
    parameters:
      ts.isConstructorDeclaration(member) || ts.isMethodDeclaration(member)
        ? member.parameters.map(param => extractParameter(param, checker))
        : undefined,
  }
  when(extractJsDoc(member), jsdoc => (result.jsdoc = jsdoc))
  return result
}

function getAccessModifier(member: ts.ClassElement): string | undefined {
  if ('modifiers' in member && member.modifiers) {
    if (member.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword)) {
      return 'private'
    } else if (
      member.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ProtectedKeyword)
    ) {
      return 'protected'
    } else if (member.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.PublicKeyword)) {
      return 'public'
    }
  }
  return undefined // If no access modifier is explicitly specified, TypeScript defaults it to 'public'
}

/**
 * Extracts enumeration declaration details.
 * @param enumDecl - The enumeration declaration node.
 * @returns The extracted enumeration data.
 */
function extractEnum(enumDecl: ts.EnumDeclaration): Enum {
  const result: Enum = {
    kind: 'Enum',
    name: enumDecl.name.getText(),
    members: enumDecl.members.map(member => {
      const result: EnumMember = {
        name: member.name.getText(),
      }
      when(extractJsDoc(member), jsdoc => (result.jsdoc = jsdoc))
      return result
    }),
  }

  when(extractJsDoc(enumDecl), jsdoc => (result.jsdoc = jsdoc))

  return result
}

/**
 * Extracts type alias declaration details.
 * @param alias - The type alias declaration node.
 * @param checker - The TypeScript type checker.
 * @returns The extracted type alias data.
 */
function extractTypeAlias(alias: ts.TypeAliasDeclaration, checker: ts.TypeChecker): TypeAlias {
  const result: TypeAlias = {
    kind: 'TypeAlias',
    name: alias.name.getText(),
    typeAnnotation: alias.type ? extractType(alias.type, checker, []) : undefined,
  }
  when(extractJsDoc(alias), jsdoc => (result.jsdoc = jsdoc))
  return result
}

/**
 * Extracts detailed type information, handling function types, object types, and other complex types.
 * @param node - The type node to process.
 * @param checker - The TypeScript type checker.
 * @returns The extracted type data.
 */

function extractType(
  node: ts.TypeNode,
  checker: ts.TypeChecker,
  jsDocTags?: readonly JSDocTag[],
): TypeAnnotation {
  if (node.kind === ts.SyntaxKind.TypeLiteral) {
    return {
      kind: 'TypeLiteral',
      members: (node as ts.TypeLiteralNode).members.map(member =>
        extractTypeMember(
          member,
          checker,
          jsDocTags?.filter(tag => tag.name === member.name?.getText()),
        ),
      ),
    }
  } else if (node.kind === ts.SyntaxKind.TypeReference) {
    const typeRef = node as ts.TypeReferenceNode
    const type = checker.getTypeAtLocation(typeRef)

    // Check whether the reference is a type-alias (type XYZ) or a reference (interface XYZ or class XYZ)
    if (type.aliasSymbol) {
      return {
        kind: 'TypeReference',
        name: type.aliasSymbol.getName(),
      }
    } else {
      return {
        kind: 'TypeReference',
        name: typeRef.typeName.getText(),
      }
    }
  } else {
    return { kind: 'PrimitiveType', type: checker.typeToString(checker.getTypeAtLocation(node)) }
  }
}

/**
 * Extracts JSDoc comments and tags from a node.
 * @param node - The node from which to extract JSDoc.
 * @returns The extracted JSDoc information.
 */
function extractJsDoc(node: ts.Node): JSDocInfo | undefined {
  const jsDocTags = ts.getJSDocTags(node)
  const jsDocs = ts.getJSDocCommentsAndTags(node)
  const comment = extractComment(jsDocs[0]?.comment)
  let description = comment ? [comment] : undefined

  let tags = jsDocTags.map(tag => ({
    tagName: tag.tagName.text,
    ...extractJsDocTagDetail(tag),
  }))

  if (!description && tags.length === 0) {
    return undefined
  }

  const result: { description?: string[]; tags?: JSDocTag[] } = {}
  when(description, description => (result.description = description))
  when(tags.length > 0 && tags, tags => (result.tags = tags))

  return result
}

/**
 * Extracts and cleans a JSDoc comment.
 * @param comment - The comment to clean.
 * @returns The cleaned comment.
 */
function extractComment(comment: ts.JSDocTag['comment']) {
  let commentText: string | undefined = undefined
  if (typeof comment === 'string') {
    commentText = comment
  } else if (comment && Array.isArray(comment)) {
    // Concatenate all parts of the comment array into a single string
    commentText = comment.map(part => part.text).join(' ')
  }
  if (commentText?.startsWith('- ')) {
    return commentText.replace('- ', '')
  }
  return commentText
}

/**
 * Extracts detailed information from a JSDoc tag, handling specific properties for documentation.
 * @param tag - The JSDoc tag to process.
 * @returns The extracted tag detail.
 */
function extractJsDocTagDetail(tag: ts.JSDocTag) {
  const result =
    tag.tagName.text === 'property'
      ? extractJsDocTagDetailProperty(tag)
      : {
          comment: extractComment(tag.comment) || undefined,
          name: (tag as any).name?.text || undefined,
          type: (tag as any).typeExpression?.type?.getText() || undefined,
        }
  // Remove empty string fields to clean up the object
  if (!result.comment) delete result.comment
  if (!result.name) delete result.name
  if (!result.type) delete result.type

  return result
}

/**
 * Special handling for 'property' JSDoc tags, extracting structured information.
 * @param tag - The 'property' JSDoc tag.
 * @returns The structured property tag detail.
 */
function extractJsDocTagDetailProperty(tag: ts.JSDocTag) {
  // Apply regex to the extracted comment text
  const match = extractComment(tag.comment)?.match(/^{(\S+)}\s+(\S+)\s+-\s+(.*)$/)
  if (match) {
    const [, type, name, description] = match
    return {
      comment: description.trim(), // Ensure description is trimmed of leading/trailing whitespace
      name,
      type,
    }
  }
  return {}
}

/**
 * Extracts details about a function parameter, including its type and any JSDoc comments.
 * @param param - The parameter declaration.
 * @param checker - The TypeScript type checker.
 * @returns The extracted parameter data.
 */
function extractParameter(param: ts.ParameterDeclaration, checker: ts.TypeChecker) {
  const result: Parameter = {
    name: param.name.getText(),
  }
  when(extractJsDoc(param), jsdoc => (result.jsdoc = jsdoc))
  when(param.type && extractType(param.type, checker, []), type => (result.type = type))
  return result
}

// Extract detailed information from type members
function extractTypeMember(
  member: ts.TypeElement,
  checker: ts.TypeChecker,
  jsDocTags?: any[],
): TypeMember {
  const inlinedJsDoc = extractJsDoc(member)
  const mergedJsDoc = mergeJsDoc(inlinedJsDoc, jsDocTags)

  const type =
    'type' in member && member.type ? extractType(member.type as ts.TypeNode, checker) : undefined

  const result: TypeMember = {
    name: member.name?.getText() || '',
  }
  when(type, type => (result.type = type))
  when(mergedJsDoc, jsdoc => (result.jsdoc = jsdoc))
  return result
}

function mergeJsDoc(
  inlinedJsDoc: JSDocInfo | undefined,
  propertyJsDocTags?: any[],
): JSDocInfo | undefined {
  const externalDescriptions =
    propertyJsDocTags && propertyJsDocTags.length > 0
      ? (propertyJsDocTags
          .map(propTag => extractComment(propTag?.comment))
          .filter(value => value !== undefined) as string[])
      : []

  const inlineDescriptions = inlinedJsDoc?.description || []
  const descriptions = [...externalDescriptions, ...inlineDescriptions]

  if (!inlinedJsDoc?.tags && descriptions.length === 0) {
    return undefined
  }

  const result: JSDocInfo = {}

  when(inlinedJsDoc?.tags, tags => (result.tags = tags))
  when(descriptions.length > 0, () => (result.description = descriptions))

  return result
}

/**
 * Initializes the extraction process and writes the output to a JSON file.
 */
function main() {
  const [inputPath, outputPath] = process.argv.slice(2) // Remove the first two elements
  const data = parseDeclarationFile(inputPath)
  const code = `export default ${JSON.stringify(data, null, 2)} as const`
  writeFile('data.ts', code, error => {
    if (error) {
      console.error(`error while writing file:`, error)
    } else {
      console.log('success: data written to data.json')
    }
  })
}

main()
