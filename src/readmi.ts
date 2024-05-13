import { writeFile } from 'fs'
import { parseDeclarationFile } from './parse'

/**
 * Initializes the extraction process and writes the output to a JSON file.
 */
function main() {
  const [inputPath, outputPath] = process.argv.slice(2) // Remove the first two elements
  const data = parseDeclarationFile(inputPath)
  const code = `import type {Type} from "@bigmistqke/readmi";\nexport default ${JSON.stringify(
    data,
    null,
    2,
  )} as const satisfies Type[]`
  writeFile(outputPath || 'data.ts', code, error => {
    if (error) {
      console.error(`error while writing file:`, error)
    } else {
      console.log('success: data written to data.json')
    }
  })
}

main()
