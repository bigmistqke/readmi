/**
 * a is 0
 */
export const a = 0,
  /**
   * a is 1
   */
  b = 1

/**
 * Tests the handling of both explicit JSDoc tags and inlined JSDoc comments within a TypeScript object type declaration.
 * This test ensures that both types of documentation are maintained and correctly parsed alongside the TypeScript types.
 * @tag test-case
 * @property {string} name - Describes the name of a product, verifying inline comment parsing.
 * @property {number} price - Specifies the price of the product, demonstrating how numeric types are documented.
 * @property {string} id - Ensures string types are handled correctly through explicit JSDoc tags.
 * @property {boolean} isActive - Validates boolean type parsing with explicit JSDoc tags.
 */
export declare const testCombinedObjectJSDoc: {
  /** Describes the name of a product */
  name: string
  /** Specifies the price of the product */
  price: number
  id: string
  isActive: boolean
}
