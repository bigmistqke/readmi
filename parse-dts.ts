import { writeFile } from 'fs'
import ts from 'typescript'

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
    extractedData.push(...extractNode(node, checker, sourceFile))
  })

  return extractedData
}

function extractNode(node: ts.Node, checker: ts.TypeChecker, sourceFile: ts.SourceFile): any[] {
  switch (node.kind) {
    case ts.SyntaxKind.VariableStatement:
      return extractVariables(node as ts.VariableStatement, checker, sourceFile)
    case ts.SyntaxKind.FunctionDeclaration:
      return [extractFunction(node as ts.FunctionDeclaration, checker, sourceFile)]
    case ts.SyntaxKind.ClassDeclaration:
      return [extractClass(node as ts.ClassDeclaration, checker, sourceFile)]
    case ts.SyntaxKind.EnumDeclaration:
      return [extractEnum(node as ts.EnumDeclaration, sourceFile)]
    case ts.SyntaxKind.TypeAliasDeclaration:
      return [extractTypeAlias(node as ts.TypeAliasDeclaration, checker, sourceFile)]
    default:
      return []
  }
}

function extractVariables(
  statement: ts.VariableStatement,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): any[] {
  return statement.declarationList.declarations.map(declaration => {
    const typeNode = declaration.type
    let typeAnnotation
    if (typeNode) {
      // Check if the variable is a function or an object and handle accordingly
      if (
        typeNode.kind === ts.SyntaxKind.FunctionType ||
        typeNode.kind === ts.SyntaxKind.TypeLiteral
      ) {
        typeAnnotation = extractType(typeNode, checker)
      } else {
        typeAnnotation = checker.typeToString(checker.getTypeAtLocation(typeNode))
      }
    }

    return {
      type: 'Variable',
      name: declaration.name.getText(sourceFile),
      jsdoc: extractJsDoc(typeNode!),
      typeAnnotation: typeAnnotation,
    }
  })
}

function extractFunction(
  func: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): any {
  const name = func.name ? func.name.getText(sourceFile) : 'anonymous'
  console.log('extract function')
  return {
    type: 'Function',
    name,
    jsdoc: extractJsDoc(func),
    parameters: func.parameters.map(param => extractParameter(param, checker, sourceFile)),
    returnType: func.type ? checker.typeToString(checker.getTypeAtLocation(func.type)) : 'void',
  }
}

function extractClass(
  cls: ts.ClassDeclaration,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): any {
  return {
    type: 'Class',
    name: cls.name ? cls.name.getText(sourceFile) : 'anonymous',
    jsdoc: extractJsDoc(cls),
    members: cls.members.map(member => extractClassMember(member, checker, sourceFile)),
  }
}

function extractClassMember(
  member: ts.ClassElement,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): any {
  if (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member)) {
    // Handle property or method declaration
    return {
      type: ts.isPropertyDeclaration(member) ? 'Property' : 'Method',
      name: member.name ? member.name.getText(sourceFile) : 'anonymous',
      jsdoc: extractJsDoc(member, checker),
      typeAnnotation: member.type
        ? checker.typeToString(checker.getTypeAtLocation(member.type))
        : undefined,
    }
  } else if (ts.isConstructorDeclaration(member)) {
    // Handle constructor declaration
    return {
      type: 'Constructor',
      name: 'constructor', // Constructors don't have a name, so we use a standard name
      jsdoc: extractJsDoc(member, checker),
      parameters: member.parameters.map(param => extractParameter(param, checker, sourceFile)),
    }
  }
  return null // Return null for unhandled class member types
}

function extractEnum(enumDecl: ts.EnumDeclaration, sourceFile: ts.SourceFile): any {
  return {
    type: 'Enum',
    name: enumDecl.name.getText(sourceFile),
    jsdoc: extractJsDoc(enumDecl),
    members: enumDecl.members.map(member => ({
      name: member.name.getText(sourceFile),
      jsdoc: extractJsDoc(member),
    })),
  }
}

function extractTypeAlias(
  alias: ts.TypeAliasDeclaration,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): any {
  return {
    type: 'TypeAlias',
    name: alias.name.getText(sourceFile),
    jsdoc: extractJsDoc(alias), // Extract JSDoc description
    typeAnnotation: alias.type ? extractType(alias.type, checker, sourceFile) : undefined,
  }
}

function extractJsDoc(node: ts.Node): any {
  const jsDocTags = ts.getAllJSDocTags(node, tag => tag.tagName.text !== undefined)
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

// Extract details about a parameter, including its type and any JSDoc comments
function extractParameter(
  param: ts.ParameterDeclaration,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): any {
  console.log('extractParameter')
  return {
    name: param.name.getText(sourceFile),
    type: param.type ? extractType(param.type, checker, sourceFile) : undefined,
    jsdoc: extractJsDoc(param),
  }
}

// Extract detailed type information, handling function types, object types, and other complex types
function extractType(node: ts.TypeNode, checker: ts.TypeChecker, sourceFile: ts.SourceFile): any {
  if (node.kind === ts.SyntaxKind.TypeLiteral) {
    return {
      kind: 'TypeLiteral',
      members: (node as ts.TypeLiteralNode).members.map(member =>
        extractMember(member, checker, sourceFile),
      ),
    }
  } else if (node.kind === ts.SyntaxKind.TypeReference) {
    const typeRef = node as ts.TypeReferenceNode
    const type = checker.getTypeAtLocation(typeRef)
    if (type.aliasSymbol) {
      // Resolve the type structure of the alias
      return {
        kind: 'TypeAlias',
        name: type.aliasSymbol.getName(),
        type: resolveTypeStructure(type, checker),
      }
    } else {
      return { kind: 'TypeReference', name: typeRef.typeName.getText(sourceFile) }
    }
  } else {
    return { kind: 'PrimitiveType', type: checker.typeToString(checker.getTypeAtLocation(node)) }
  }
}

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

// // Recursively extract type information, handling complex types like TypeLiteral and TypeReference
// function extractType(node: ts.TypeNode, checker: ts.TypeChecker): any {
//   if (node.kind === ts.SyntaxKind.TypeLiteral) {
//     console.log('extract TypeLiteral')

//     const literal = node as ts.TypeLiteralNode
//     return {
//       kind: 'TypeLiteral',
//       members: literal.members.map(member => extractMember(member, checker)),
//     }
//   } else if (node.kind === ts.SyntaxKind.TypeReference) {
// const typeRef = node as ts.TypeReferenceNode
// const type = checker.getTypeAtLocation(typeRef)
// if (type.symbol && type.symbol.members) {
//   return {
//     kind: 'TypeReference',
//     name: type.symbol.name,
//     members: Array.from(type.symbol.members.values()).map(symbol =>
//       extractSymbol(symbol, checker),
//     ),
//   }
// } else {
//   return checker.typeToString(type)
// }
//   } else {
//     return checker.typeToString(checker.getTypeAtLocation(node))
//   }
// }

// Extract detailed information from type members
function extractMember(
  member: ts.TypeElement,
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): any {
  return {
    name: member.name ? member.name.getText() : 'anonymous',
    type: 'type' in member ? extractType(member.type, checker, sourceFile) : undefined,
    jsdoc: extractJsDoc(member),
  }
}

// Extract details from a type's symbol
function extractSymbol(symbol: ts.Symbol, checker: ts.TypeChecker): any {
  const type = checker.getDeclaredTypeOfSymbol(symbol)
  return {
    name: symbol.getName(),
    type: checker.typeToString(type),
    jsdoc: symbol
      .getDocumentationComment(checker)
      .map(part => part.text)
      .join(' '),
  }
}

const [path] = process.argv.slice(2) // Remove the first two elements
const data = parseDeclarationFile(path)
writeFile('data.json', JSON.stringify(data, null, 2), error => {
  if (error) {
    console.error(`error while writing file:`, error)
  } else {
    console.log('success: data written to data.json')
  }
})
