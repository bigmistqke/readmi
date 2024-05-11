import { writeFile } from 'fs'
import ts from 'typescript'

/**
 * Parses a TypeScript declaration file to extract various symbols and their documentation.
 * @param {string} filePath - The path to the TypeScript file.
 * @returns {any[]} The extracted data from the TypeScript file.
 */
function parseDeclarationFile(filePath: string): any[] {
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
  const extractedData: any[] = []

  ts.forEachChild(sourceFile, node => {
    extractedData.push(...extractNode(node, checker))
  })

  return extractedData
}

/**
 * Dispatch function to handle different types of TypeScript nodes.
 * @param {ts.Node} node - The current TypeScript node to process.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any[]} An array of extracted data from the node.
 */
function extractNode(node: ts.Node, checker: ts.TypeChecker): any[] {
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
 * @param {ts.VariableStatement} statement - The variable statement node.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any[]} An array of extracted variable data.
 */
function extractVariables(statement: ts.VariableStatement, checker: ts.TypeChecker): any[] {
  const jsDoc = extractJsDoc(statement)
  return statement.declarationList.declarations.map(declaration => {
    const typeNode = declaration.type
    let typeAnnotation
    if (typeNode) {
      typeAnnotation = extractType(typeNode, checker, jsDoc.tags)
    }

    return {
      type: 'Variable',
      name: declaration.name.getText(),
      jsdoc: jsDoc,
      typeAnnotation: typeAnnotation,
    }
  })
}

function findJsDocTagsForMember(member: ts.TypeElement, jsDocTags: any[]): any[] {
  return jsDocTags.filter(tag => tag.name === member.name.getText())
}

/**
 * Extracts function declaration details.
 * @param {ts.FunctionDeclaration} func - The function declaration node.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any} The extracted function data.
 */
function extractFunction(func: ts.FunctionDeclaration, checker: ts.TypeChecker): any {
  const name = func.name ? func.name.getText() : 'anonymous'
  return {
    type: 'Function',
    name,
    jsdoc: extractJsDoc(func),
    parameters: func.parameters.map(param => extractParameter(param, checker)),
    returnType: func.type ? checker.typeToString(checker.getTypeAtLocation(func.type)) : 'void',
  }
}

/**
 * Extracts class declaration details, including properties and methods.
 * @param {ts.ClassDeclaration} cls - The class declaration node.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any} The extracted class data.
 */
function extractClass(cls: ts.ClassDeclaration, checker: ts.TypeChecker): any {
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
  const isAbstract = cls.modifiers?.some(
    modifier => modifier.kind === ts.SyntaxKind.AbstractKeyword,
  )

  return {
    type: 'Class',
    name: cls.name ? cls.name.getText() : 'anonymous',
    isAbstract,
    jsdoc: extractJsDoc(cls),
    extends: extendsName,
    members: cls.members.map(member => extractClassMember(member, checker)).filter(Boolean),
  }
}

/**
 * Extracts individual class members such as properties and methods.
 * @param {ts.ClassElement} member - The class member to process.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any|null} The extracted member data or null if the member type is not handled.
 */
function extractClassMember(member: ts.ClassElement, checker: ts.TypeChecker): any {
  const isPrivateField =
    ts.isPropertyDeclaration(member) && member.name.kind === ts.SyntaxKind.PrivateIdentifier

  if (isPrivateField) return null

  const name = member.name?.getText()
  const accessModifier = getAccessModifier(member)

  return {
    type: ts.isPropertyDeclaration(member)
      ? 'Property'
      : ts.isMethodDeclaration(member)
      ? 'Method'
      : 'Constructor',
    name: name,
    accessModifier: accessModifier,
    jsdoc: extractJsDoc(member),
    typeAnnotation: member.type
      ? checker.typeToString(checker.getTypeAtLocation(member.type))
      : undefined,
    parameters:
      ts.isConstructorDeclaration(member) || ts.isMethodDeclaration(member)
        ? member.parameters.map(param => extractParameter(param, checker))
        : undefined,
  }
}

function getAccessModifier(member: ts.ClassElement): string | undefined {
  if (member.modifiers) {
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
 * @param {ts.EnumDeclaration} enumDecl - The enumeration declaration node.
 * @returns {any} The extracted enumeration data.
 */
function extractEnum(enumDecl: ts.EnumDeclaration): any {
  return {
    type: 'Enum',
    name: enumDecl.name.getText(),
    jsdoc: extractJsDoc(enumDecl),
    members: enumDecl.members.map(member => ({
      name: member.name.getText(),
      jsdoc: extractJsDoc(member),
    })),
  }
}

/**
 * Extracts type alias declaration details.
 * @param {ts.TypeAliasDeclaration} alias - The type alias declaration node.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any} The extracted type alias data.
 */
function extractTypeAlias(alias: ts.TypeAliasDeclaration, checker: ts.TypeChecker): any {
  return {
    type: 'TypeAlias',
    name: alias.name.getText(),
    jsdoc: extractJsDoc(alias), // Extract JSDoc description
    typeAnnotation: alias.type ? extractType(alias.type, checker, []) : undefined,
  }
}

/**
 * Extracts detailed type information, handling function types, object types, and other complex types.
 * @param {ts.TypeNode} node - The type node to process.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any} The extracted type data.
 */

function extractType(node: ts.TypeNode, checker: ts.TypeChecker, jsDocTags: any[]): any {
  if (node.kind === ts.SyntaxKind.TypeLiteral) {
    return {
      kind: 'TypeLiteral',
      members: (node as ts.TypeLiteralNode).members.map(member =>
        extractMember(member, checker, findJsDocTagsForMember(member, jsDocTags)),
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
 * Resolves the structure of a type, particularly useful for type aliases and complex types.
 * @param {ts.Type} type - The type to resolve.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any} The resolved type structure.
 */
function resolveTypeStructure(type: ts.Type, checker: ts.TypeChecker): any {
  if (type.isUnionOrIntersection()) {
    return {
      kind: type.flags & ts.TypeFlags.Union ? 'Union' : 'Intersection',
      types: type.types.map(t => resolveTypeStructure(t, checker)),
    }
  } else if (type.symbol && type.symbol.members && type.symbol.members.size > 0) {
    let members = []
    type.symbol.members.forEach((member, key) => {
      if (member.declarations[0]) {
        const memberType = checker.getTypeAtLocation(member.declarations[0])
        members.push({
          name: key,
          type: checker.typeToString(memberType, undefined, ts.TypeFormatFlags.NoTruncation),
        })
      }
    })
    return members
  }
  // For type aliases that directly reference another alias or a more complex type, show a more descriptive type
  return checker.typeToString(
    type,
    undefined,
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteTypeArgumentsOfSignature,
  )
}

/**
 * Extracts JSDoc comments and tags from a node.
 * @param {ts.Node} node - The node from which to extract JSDoc.
 * @returns {any} The extracted JSDoc information.
 */
function extractJsDoc(node: ts.Node): any {
  const jsDocTags = ts.getJSDocTags(node)
  const jsDocs = ts.getJSDocCommentsAndTags(node)
  let description = extractComment(jsDocs[0]?.comment)

  let tags = jsDocTags.map(tag => ({
    tagName: tag.tagName.text,
    ...extractJsDocTagDetail(tag),
  }))

  if (tags.length === 0) {
    return { description }
  }

  return {
    description,
    tags,
  }
}

/**
 * Extracts and cleans a JSDoc comment.
 * @param {ts.JSDocTag['comment']} comment - The comment to clean.
 * @returns {string} The cleaned comment.
 */
function extractComment(comment: ts.JSDocTag['comment']) {
  let commentText = ''
  if (typeof comment === 'string') {
    commentText = comment
  } else if (comment && Array.isArray(comment)) {
    // Concatenate all parts of the comment array into a single string
    commentText = comment.map(part => part.text).join(' ')
  }
  if (commentText.startsWith('- ')) {
    return commentText.replace('- ', '')
  }
  return commentText
}

/**
 * Extracts detailed information from a JSDoc tag, handling specific properties for documentation.
 * @param {ts.JSDocTag} tag - The JSDoc tag to process.
 * @returns {any} The extracted tag detail.
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
 * @param {ts.JSDocTag} tag - The 'property' JSDoc tag.
 * @returns {any} The structured property tag detail.
 */
function extractJsDocTagDetailProperty(tag: ts.JSDocTag) {
  // Apply regex to the extracted comment text
  const match = extractComment(tag.comment).match(/^{(\S+)}\s+(\S+)\s+-\s+(.*)$/)
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
 * @param {ts.ParameterDeclaration} param - The parameter declaration.
 * @param {ts.TypeChecker} checker - The TypeScript type checker.
 * @returns {any} The extracted parameter data.
 */
function extractParameter(param: ts.ParameterDeclaration, checker: ts.TypeChecker): any {
  return {
    name: param.name.getText(),
    type: param.type ? extractType(param.type, checker, []) : undefined,
    jsdoc: extractJsDoc(param),
  }
}

// Extract detailed information from type members
function extractMember(member: ts.TypeElement, checker: ts.TypeChecker, jsDocTags: any[]): any {
  const type = member.type
    ? checker.typeToString(checker.getTypeAtLocation(member.type))
    : undefined
  let inlinedJsDoc = extractJsDoc(member)
  let mergedJsDoc = mergeJsDoc(inlinedJsDoc, jsDocTags)

  return {
    name: member.name.getText(),
    type: { kind: 'PrimitiveType', type: type },
    jsdoc: mergedJsDoc,
  }
}

function mergeJsDoc(inlinedJsDoc, propertyJsDocTags) {
  const result: { type: 'description'; comment: string }[] = []
  propertyJsDocTags.forEach(propTag => {
    // Check if a tag for this property already exists, if not, add it
    if (!result.some(tag => tag.name === propTag.name)) {
      result.push({ type: 'description', comment: propTag?.comment })
    }
  })
  if (inlinedJsDoc.tags) {
    result.push(...inlinedJsDoc.tags)
  }
  if (inlinedJsDoc.description) {
    result.push({ type: 'description', comment: inlinedJsDoc.description })
  }

  return result
}

/**
 * Initializes the extraction process and writes the output to a JSON file.
 */
function main() {
  const [path] = process.argv.slice(2) // Remove the first two elements
  const data = parseDeclarationFile(path)
  writeFile('data.json', JSON.stringify(data, null, 2), error => {
    if (error) {
      console.error(`error while writing file:`, error)
    } else {
      console.log('success: data written to data.json')
    }
  })
}

main()
