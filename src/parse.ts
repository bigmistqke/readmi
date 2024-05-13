import ts from 'typescript'
import type {
  ClassElement,
  ClassMember,
  EnumElement,
  EnumMember,
  FunctionElement,
  GenericDeclaration,
  JSDocInfo,
  JSDocTag,
  Parameter,
  TypeAliasElement,
  TypeAnnotation,
  TypeElement,
  TypeLiteralMember,
  VariableElement,
} from './types'

const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })

/**
 * Parses a TypeScript declaration file to extract various symbols and their documentation.
 * @param filePath - The path to the TypeScript file.
 * @returns The extracted data from the TypeScript file.
 */
export function parseDeclarationFile(filePath: string) {
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
  const extractedTypes: TypeElement[] = []

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
function extractNode(node: ts.Node, checker: ts.TypeChecker): TypeElement[] {
  switch (node.kind) {
    case ts.SyntaxKind.VariableStatement:
      return extractVariables(node as ts.VariableStatement, checker)
    case ts.SyntaxKind.FunctionDeclaration:
      return [extractFunction(node as ts.FunctionDeclaration, checker)]
    case ts.SyntaxKind.ClassDeclaration:
      return [extractClass(node as ts.ClassDeclaration, checker)]
    case ts.SyntaxKind.EnumDeclaration:
      return [extractEnum(node as ts.EnumDeclaration, checker)]
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
function extractVariables(
  statement: ts.VariableStatement,
  checker: ts.TypeChecker,
): VariableElement[] {
  const jsdoc = extractJsDoc(statement)

  return statement.declarationList.declarations.map(declaration => {
    const result: VariableElement = {
      kind: 'Variable',
      name: declaration.name.getText(),
      jsdoc,
      literal: declaration.type
        ? printer
            .printNode(ts.EmitHint.Unspecified, declaration, declaration.getSourceFile())
            .replace('export type ', '')
        : undefined,
    }

    if (declaration.type) {
      result.typeAnnotation = extractTypeAnnotation(declaration.type, checker, jsdoc?.tags)
    }

    return result
  })
}

function extractGenerics(node: ts.Node, checker: ts.TypeChecker): GenericDeclaration[] | undefined {
  if (
    !ts.isFunctionDeclaration(node) &&
    !ts.isMethodSignature(node) &&
    !ts.isFunctionTypeNode(node) &&
    !ts.isTypeAliasDeclaration(node)
  ) {
    return
  }

  const generics =
    'typeParameters' in node &&
    node.typeParameters?.map(param => {
      const name = param.name.text
      const extendsType = param.constraint
        ? checker.typeToString(checker.getTypeFromTypeNode(param.constraint))
        : undefined
      const defaultValue = param.default
        ? checker.typeToString(checker.getTypeFromTypeNode(param.default))
        : undefined
      return { name, extends: extendsType, defaultValue }
    })

  if (!generics || generics.length === 0) {
    return undefined
  }

  return generics
}

/**
 * Extracts function declaration details.
 * @param func - The function declaration node.
 * @param checker - The TypeScript type checker.
 * @returns The extracted function data.
 */
function extractFunction(func: ts.FunctionDeclaration, checker: ts.TypeChecker): FunctionElement {
  const name = func.name ? func.name.getText() : 'anonymous'
  const result: FunctionElement = {
    kind: 'Function',
    name,
    parameters: func.parameters.map(param => extractParameter(param, checker)),
    returnType: func.type ? extractTypeAnnotation(func.type, checker) : undefined,
    generics: extractGenerics(func, checker),
    jsdoc: extractJsDoc(func),
  }
  return result
}

/**
 * Extracts class declaration details, including properties and methods.
 * @param cls - The class declaration node.
 * @param checker - The TypeScript type checker.
 * @returns The extracted class data.
 */
function extractClass(cls: ts.ClassDeclaration, checker: ts.TypeChecker): ClassElement {
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

  const result: ClassElement = {
    kind: 'Class',
    name: cls.name ? cls.name.getText() : 'anonymous',
    isAbstract,
    extends: extendsName,
    members: cls.members.map(member => extractClassMember(member, checker)).filter(Boolean),
    jsdoc: extractJsDoc(cls),
  }

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
    jsdoc: extractJsDoc(member),
    typeAnnotation: extractTypeAnnotation(member, checker),
    parameters:
      ts.isConstructorDeclaration(member) || ts.isMethodDeclaration(member)
        ? member.parameters.map(param => extractParameter(param, checker))
        : undefined,
    accessModifier: accessModifier,
  }
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
function extractEnum(enumDecl: ts.EnumDeclaration, checker: ts.TypeChecker): EnumElement {
  const result: EnumElement = {
    kind: 'Enum',
    name: enumDecl.name.getText(),
    jsdoc: extractJsDoc(enumDecl),
    members: enumDecl.members.map(member => {
      const enumValue = member.initializer ? checker.getTypeAtLocation(member.initializer) : null
      const result: EnumMember = {
        name: member.name.getText(),
        jsdoc: extractJsDoc(member),
        value: enumValue?.value,
        typeAnnotation: {
          kind: 'PrimitiveType',
          literal: typeof enumValue?.value,
        },
      }
      return result
    }),
  }

  return result
}

/**
 * Extracts type alias declaration details.
 * @param alias - The type alias declaration node.
 * @param checker - The TypeScript type checker.
 * @returns The extracted type alias data.
 */
function extractTypeAlias(
  alias: ts.TypeAliasDeclaration,
  checker: ts.TypeChecker,
): TypeAliasElement {
  const result: TypeAliasElement = {
    kind: 'TypeAlias',
    name: alias.name.getText(),
    jsdoc: extractJsDoc(alias),
    generics: extractGenerics(alias, checker),
    typeAnnotation: alias.type ? extractTypeAnnotation(alias.type, checker, []) : undefined,
    literal: printer
      .printNode(ts.EmitHint.Unspecified, alias, alias.getSourceFile())
      .replace('export type ', ''),
  }
  return result
}

/**
 * Extracts detailed type information, handling function types, object types, and other complex types.
 * @param typeNode - The type node to process.
 * @param checker - The TypeScript type checker.
 * @returns The extracted type data.
 */

function extractTypeAnnotation(
  typeNode: ts.TypeNode,
  checker: ts.TypeChecker,
  jsDocTags?: readonly JSDocTag[],
): TypeAnnotation {
  switch (typeNode.kind) {
    case ts.SyntaxKind.TypeLiteral:
      return {
        kind: 'TypeLiteral',
        generics: extractGenerics(typeNode, checker),
        literal: checker.typeToString(checker.getTypeAtLocation(typeNode)),
        members: (typeNode as ts.TypeLiteralNode).members.map(member =>
          extractTypeLiteralMember(
            member,
            checker,
            jsDocTags?.filter(tag => tag.name === member.name?.getText()),
          ),
        ),
      }
    case ts.SyntaxKind.FunctionType:
      const funcNode = typeNode as ts.FunctionTypeNode
      return {
        kind: 'FunctionType',
        literal: checker.typeToString(checker.getTypeAtLocation(typeNode)),
        parameters: funcNode.parameters.map(param => extractParameter(param, checker)),
        returnType: extractTypeAnnotation(funcNode.type, checker),
        generics: extractGenerics(funcNode, checker),
      }
    case ts.SyntaxKind.TypeReference:
      const typeRef = typeNode as ts.TypeReferenceNode
      const type = checker.getTypeAtLocation(typeRef)
      return {
        kind: 'TypeReference',

        name: type.aliasSymbol ? type.aliasSymbol.getName() : typeRef.typeName.getText(),
        parameters: typeRef.typeArguments?.map(arg => extractTypeAnnotation(arg, checker)),
      }
    case ts.SyntaxKind.TupleType:
      const tupleNode = typeNode as ts.TupleTypeNode
      return {
        kind: 'Tuple',
        literal: checker.typeToString(checker.getTypeAtLocation(typeNode), typeNode),
        types: tupleNode.elements.map(element => extractTypeAnnotation(element, checker)),
      }
    case ts.SyntaxKind.IntersectionType:
      const intersectionNode = typeNode as ts.IntersectionTypeNode
      return {
        kind: 'Intersection',
        literal: checker.typeToString(checker.getTypeAtLocation(typeNode)),
        types: intersectionNode.types.map(type => extractTypeAnnotation(type, checker)),
      }
    case ts.SyntaxKind.UnionType:
      const unionNode = typeNode as ts.UnionTypeNode
      return {
        kind: 'Union',
        literal: checker.typeToString(checker.getTypeAtLocation(typeNode)),
        types: unionNode.types.map(type => extractTypeAnnotation(type, checker)),
      }
    default:
      return {
        kind: 'PrimitiveType',
        literal: checker.typeToString(checker.getTypeAtLocation(typeNode)),
      }
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

  const result: JSDocInfo = {
    description,
  }
  if (tags.length > 0) {
    result.tags = tags
  }

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
function extractJsDocTagDetail(tag: ts.JSDocTag): JSDocTag {
  const result =
    tag.tagName.text === 'property'
      ? extractJsDocTagDetailProperty(tag)
      : {
          comment: extractComment(tag.comment) || undefined,
          name: (tag as any).name?.text || undefined,
          literal: (tag as any).typeExpression?.type?.getText() || undefined,
        }

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
    const [, literal, name, description] = match
    return {
      comment: description.trim(), // Ensure description is trimmed of leading/trailing whitespace
      name,
      literal,
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
    jsdoc: extractJsDoc(param),
    typeAnnotation: param.type ? extractTypeAnnotation(param.type, checker, []) : undefined,
  }
  return result
}

// Extract detailed information from type members
function extractTypeLiteralMember(
  member: ts.TypeElement,
  checker: ts.TypeChecker,
  jsDocTags?: any[],
): TypeLiteralMember {
  const inlinedJsDoc = extractJsDoc(member)
  const jsdoc = mergeJsDoc(inlinedJsDoc, jsDocTags)

  const type =
    'type' in member && member.type
      ? extractTypeAnnotation(member.type as ts.TypeNode, checker)
      : undefined

  const result: TypeLiteralMember = {
    name: member.name?.getText() || '',
    typeAnnotation: type,
    jsdoc,
  }

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

  const result: JSDocInfo = {
    tags: inlinedJsDoc?.tags,
  }

  if (descriptions.length > 0) {
    result.description = descriptions
  }

  return result
}
