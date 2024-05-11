// /**
//  * A simple primitive variable with a JSDoc comment.
//  * @type {number}
//  */
// export const someNumber: number = 42

// /**
//  * An object with JSDoc comments describing properties through JSDoc tags.
//  * @property {string} id - A unique identifier.
//  * @property {boolean} isActive - The status of the object.
//  */
// export const user = {
//   id: '12345',
//   isActive: true,
// }

// /**
//  * An object with properties annotated with inlined JSDoc comments.
//  */
// export const product: {
//   /** The name of the product */
//   name: string
//   /** The price of the product */
//   price: number
// } = {
//   name: 'Example Product',
//   price: 99.99,
// }

// type Product = {
//   /** The name of the product */
//   name: string
//   /** The price of the product */
//   price: number
// }

// /**
//  * An object with properties annotated with inlined JSDoc comments.
//  */
// export const product2: Product = {
//   name: 'Example Product',
//   price: 99.99,
// }

// /**
//  * Arrow function with JSDoc comments.
//  * @param {{ key: string, value: any, callback: Function }} config - The configuration object.
//  * @param {Settings} settings - The settings applied.
//  * @example
//  * processConfig({
//  *   key: 'color',
//  *   value: 'blue',
//  *   callback: (userInfo, settings) => console.log(userInfo, settings)
//  * }, { theme: 'dark', layout: 'compact' });
//  */
// export const processConfig = (
//   config: {
//     /** The key in the configuration */
//     key: string
//     /** The value associated with the key */
//     value: any
//     /**
//      * The callback in the configuration
//      * @param {{ name: string, age: number }} userInfo - User details.
//      * @param {Settings} settings - User specific settings.
//      * @example
//      * config.callback({ name: 'John', age: 30 }, { theme: 'dark', layout: 'compact' });
//      */
//     callback: (
//       userInfo: {
//         /** The name of the user */
//         name: string
//         /** The age of the user */
//         age: number
//       },
//       settings: Settings,
//     ) => void
//   },
//   settings: Settings,
// ) => {
//   console.log(config, settings)
// }

/**
 * Function expression with JSDoc comments.
 * @param {{ key: string, value: any }} config - The configuration object.
 * @param {Settings} settings - The settings applied.
 * @example
 * processConfigFuncExpr({ key: 'mode', value: 'auto' }, { theme: 'light', layout: 'wide' });
 */
export const processConfigFuncExpr = function (
  config: {
    /** The key in the configuration */
    key: string
    /** The value associated with the key */
    value: any
  },
  settings: Settings,
) {
  console.log(config, settings)
}

/**
 * Traditional function with JSDoc comments.
 * @param {{ key: string, value: any }} config - The configuration object.
 * @param {Settings} settings - The settings applied.
 * @example
 * processConfigTraditional({ key: 'speed', value: 'fast' }, { theme: 'blue', layout: 'minimal' });
 */
export function processConfigTraditional(
  config: {
    /** The key in the configuration */
    key: string
    /** The value associated with the key */
    value: any
  },
  settings: Settings,
) {
  console.log(config, settings)
}

/**
 * A type alias used for settings objects with detailed property JSDoc.
 */
export type Settings = {
  /** The theme of the settings */
  theme: string
  /** The layout of the settings */
  layout: string
}

/**
 * Class with properties and methods, including constructor parameters annotated with JSDoc.
 * @example
 * const ui = new UserInterface({ name: 'Alice', age: 28 }, { theme: 'light', layout: 'responsive' });
 */
export class UserInterface {
  /** The name of the user */
  private name: string

  /**
   * UserInterface constructor.
   * @param {{ name: string, age: number }} userInfo - Basic user information.
   * @param {Settings} settings - User specific settings.
   */
  constructor(
    userInfo: {
      /** The name of the user */
      name: string
      /** The age of the user */
      age: number
    },
    settings: Settings,
  ) {
    this.name = userInfo.name
    console.log(userInfo, settings)
  }

  /**
   * Greet the user.
   * @returns {string} Greeting message
   * @example
   * console.log(ui.greet());
   */
  greet() {
    return `Hello, ${this.name}!`
  }
}

/**
 * Additional feature to test the parser with an enum.
 */
enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

/**
 * Logs a message at a specific log level.
 * @param {LogLevel} level - The level to log the message at.
 * @param {string} message - The message to log.
 * @example
 * logMessage(LogLevel.INFO, 'This is an informational message');
 */
export function logMessage(level: LogLevel, message: string) {
  console.log(`[${level}]: ${message}`)
}
