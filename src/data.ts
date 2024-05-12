export default [
  {
    "kind": "Variable",
    "name": "testSimpleNumericType",
    "jsdoc": {
      "description": [
        "Tests the parsing of a simple numeric type to ensure basic type annotations are correctly interpreted."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        }
      ]
    },
    "typeAnnotation": {
      "kind": "PrimitiveType",
      "type": "number"
    }
  },
  {
    "kind": "Variable",
    "name": "testObjectWithJSDocProperties",
    "jsdoc": {
      "description": [
        "Tests object parsing with explicit JSDoc tags for properties. This test checks the extraction and\nlinking of property types and descriptions from JSDoc to TypeScript objects."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        },
        {
          "tagName": "property",
          "comment": "Ensures string types are handled correctly.",
          "name": "id",
          "type": "string"
        },
        {
          "tagName": "property",
          "comment": "Validates boolean type parsing.",
          "name": "isActive",
          "type": "boolean"
        }
      ]
    },
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "members": [
        {
          "name": "id",
          "type": {
            "kind": "PrimitiveType",
            "type": "string"
          },
          "jsdoc": {
            "description": [
              "Ensures string types are handled correctly."
            ]
          }
        },
        {
          "name": "isActive",
          "type": {
            "kind": "PrimitiveType",
            "type": "boolean"
          },
          "jsdoc": {
            "description": [
              "Validates boolean type parsing."
            ]
          }
        }
      ]
    }
  },
  {
    "kind": "Variable",
    "name": "testObjectWithInlinedJSDoc",
    "jsdoc": {
      "description": [
        "Tests the handling of inlined JSDoc comments within a TypeScript object type declaration.\nThis test verifies that property descriptions are maintained alongside their type annotations."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        }
      ]
    },
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "members": [
        {
          "name": "name",
          "type": {
            "kind": "PrimitiveType",
            "type": "string"
          },
          "jsdoc": {
            "description": [
              "Describes the name of a product"
            ]
          }
        },
        {
          "name": "price",
          "type": {
            "kind": "PrimitiveType",
            "type": "number"
          },
          "jsdoc": {
            "description": [
              "Specifies the price of the product"
            ]
          }
        }
      ]
    }
  },
  {
    "kind": "Variable",
    "name": "destructuringProperty",
    "jsdoc": {
      "description": [
        "Tests destructuring assignments where the object being destructured has its own JSDoc comments.\nVerifies whether the comments are maintained or lost upon destructuring."
      ]
    },
    "typeAnnotation": {
      "kind": "PrimitiveType",
      "type": "string"
    }
  },
  {
    "kind": "Variable",
    "name": "testCombinedObjectJSDoc",
    "jsdoc": {
      "description": [
        "Tests the handling of both explicit JSDoc tags and inlined JSDoc comments within a TypeScript object type declaration.\nThis test ensures that both types of documentation are maintained and correctly parsed alongside the TypeScript types."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        },
        {
          "tagName": "property",
          "comment": "Describes the name of a product, verifying inline comment parsing.",
          "name": "name",
          "type": "string"
        },
        {
          "tagName": "property",
          "comment": "Specifies the price of the product, demonstrating how numeric types are documented.",
          "name": "price",
          "type": "number"
        },
        {
          "tagName": "property",
          "comment": "Ensures string types are handled correctly through explicit JSDoc tags.",
          "name": "id",
          "type": "string"
        },
        {
          "tagName": "property",
          "comment": "Validates boolean type parsing with explicit JSDoc tags.",
          "name": "isActive",
          "type": "boolean"
        }
      ]
    },
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "members": [
        {
          "name": "name",
          "type": {
            "kind": "PrimitiveType",
            "type": "string"
          },
          "jsdoc": {
            "tags": [
              {
                "tagName": "tag",
                "comment": "test-combined-object-jsdoc-name"
              },
              {
                "tagName": "example",
                "comment": "const name = testCombinedObjectJSDoc.name"
              }
            ],
            "description": [
              "Describes the name of a product, verifying inline comment parsing.",
              "Describes the name of a product"
            ]
          }
        },
        {
          "name": "price",
          "type": {
            "kind": "PrimitiveType",
            "type": "number"
          },
          "jsdoc": {
            "tags": [
              {
                "tagName": "tag",
                "comment": "test-combined-object-jsdoc-price"
              },
              {
                "tagName": "example",
                "comment": "const price = testCombinedObjectJSDoc.price"
              }
            ],
            "description": [
              "Specifies the price of the product, demonstrating how numeric types are documented.",
              "Specifies the price of the product"
            ]
          }
        },
        {
          "name": "id",
          "type": {
            "kind": "PrimitiveType",
            "type": "string"
          },
          "jsdoc": {
            "description": [
              "Ensures string types are handled correctly through explicit JSDoc tags."
            ]
          }
        },
        {
          "name": "isActive",
          "type": {
            "kind": "PrimitiveType",
            "type": "boolean"
          },
          "jsdoc": {
            "description": [
              "Validates boolean type parsing with explicit JSDoc tags."
            ]
          }
        }
      ]
    }
  },
  {
    "kind": "TypeAlias",
    "name": "Product",
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "members": [
        {
          "name": "name",
          "type": {
            "kind": "PrimitiveType",
            "type": "string"
          },
          "jsdoc": {
            "description": [
              "Documents a product's name within a type alias"
            ]
          }
        },
        {
          "name": "price",
          "type": {
            "kind": "PrimitiveType",
            "type": "number"
          },
          "jsdoc": {
            "description": [
              "Documents a product's price within a type alias"
            ]
          }
        }
      ]
    }
  },
  {
    "kind": "Variable",
    "name": "testProductTypeAlias",
    "jsdoc": {
      "description": [
        "Tests referencing a type alias in an object declaration to verify that type aliases are resolved\nand applied correctly in object contexts."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        }
      ]
    },
    "typeAnnotation": {
      "kind": "TypeReference",
      "name": "Product"
    }
  },
  {
    "kind": "Function",
    "name": "testCreatingSimpleObject",
    "parameters": [],
    "returnType": {
      "kind": "TypeLiteral",
      "members": [
        {
          "name": "property",
          "type": {
            "kind": "PrimitiveType",
            "type": "string"
          }
        }
      ]
    },
    "jsdoc": {
      "description": [
        "Tests defining and returning a custom object type using a function with a JSDoc `@returns` tag.\nThis case checks the correct application of typedefs in function return types."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        },
        {
          "tagName": "returns",
          "comment": "Demonstrates returning a structured object with predefined typedef.",
          "type": "SimpleObject"
        }
      ]
    }
  },
  {
    "kind": "Variable",
    "name": "testGenericTypeInference",
    "jsdoc": {
      "description": [
        "Tests generic type parameter inference within a scoped function that declares a local generic type.\nThis tests the scope handling and type inference capabilities of generics in nested contexts."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        }
      ]
    },
    "typeAnnotation": {
      "kind": "PrimitiveType",
      "type": "<T>() => { id: T; }"
    }
  },
  {
    "kind": "Variable",
    "name": "testFunctionWithComplexParams",
    "jsdoc": {
      "description": [
        "Tests complex configuration objects with callbacks, focusing on inlined JSDoc comments for deeply\n nested object properties and functions. This ensures detailed documentation within nested structures is parsed and represented accurately."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        }
      ]
    },
    "typeAnnotation": {
      "kind": "PrimitiveType",
      "type": "(config: { key: string; value: number; callback: (userInfo: { name: string; age: number; }, settings: Settings) => void; }, settings: Settings) => void"
    }
  },
  {
    "kind": "Function",
    "name": "testTraditionalFunctionSyntax",
    "parameters": [
      {
        "name": "config",
        "type": {
          "kind": "TypeLiteral",
          "members": [
            {
              "name": "key",
              "type": {
                "kind": "PrimitiveType",
                "type": "string"
              },
              "jsdoc": {
                "description": [
                  "Inlined jsdoc comment for key"
                ]
              }
            },
            {
              "name": "value",
              "type": {
                "kind": "PrimitiveType",
                "type": "number"
              },
              "jsdoc": {
                "description": [
                  "Inlined jsdoc comment for value"
                ]
              }
            }
          ]
        }
      },
      {
        "name": "settings",
        "type": {
          "kind": "TypeReference",
          "name": "Settings"
        }
      }
    ],
    "returnType": {
      "kind": "PrimitiveType",
      "type": "void"
    },
    "jsdoc": {
      "description": [
        "Tests the declaration and implementation of a function using traditional syntax, focusing on parameter\nhandling and JSDoc integration within a conventional function declaration."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case-traditional-function-syntax"
        }
      ]
    }
  },
  {
    "kind": "TypeAlias",
    "name": "Settings",
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "members": [
        {
          "name": "theme",
          "type": {
            "kind": "PrimitiveType",
            "type": "string"
          },
          "jsdoc": {
            "description": [
              "Theme setting of the application"
            ]
          }
        },
        {
          "name": "layout",
          "type": {
            "kind": "PrimitiveType",
            "type": "string"
          },
          "jsdoc": {
            "description": [
              "Layout setting of the application"
            ]
          }
        }
      ]
    },
    "jsdoc": {
      "description": [
        "Tests the documentation of settings using a type alias, emphasizing the detailed property JSDoc within\na type structure to ensure types are not only parsed correctly but also thoroughly documented."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        }
      ]
    }
  },
  {
    "kind": "Class",
    "name": "TestClassWithPropertiesAndMethods",
    "isAbstract": false,
    "members": [
      {
        "kind": "Property",
        "name": "firstName",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "string"
        },
        "jsdoc": {
          "description": [
            "Publicly accessible first name of the user"
          ]
        }
      },
      {
        "kind": "Constructor",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "any"
        },
        "parameters": [],
        "jsdoc": {
          "description": [
            "Constructor that initializes user details."
          ]
        }
      },
      {
        "kind": "Method",
        "name": "greet",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "() => string"
        },
        "parameters": [],
        "jsdoc": {
          "description": [
            "Method that greets the user, demonstrating return type documentation."
          ]
        }
      },
      {
        "kind": "Property",
        "name": "logDetails",
        "accessModifier": "private",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "any"
        },
        "jsdoc": {
          "description": [
            "A private method demonstrating privacy within classes.\nThis method logs a private message."
          ]
        }
      },
      {
        "kind": "Method",
        "name": "getDetails",
        "accessModifier": "protected",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "() => string"
        },
        "parameters": [],
        "jsdoc": {
          "description": [
            "A protected method showing how protected members are handled.\nThis method returns the details in a formatted string."
          ]
        }
      }
    ],
    "jsdoc": {
      "description": [
        "Tests class declaration capabilities with private and public properties, constructor parameters,\nand method annotations. This test verifies that access modifiers and privacy settings are respected\nand documented accurately."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        }
      ]
    }
  },
  {
    "kind": "Class",
    "name": "AbstractUser",
    "isAbstract": true,
    "members": [
      {
        "kind": "Property",
        "name": "name",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "string"
        },
        "jsdoc": {
          "description": [
            "The name of the user"
          ]
        }
      },
      {
        "kind": "Constructor",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "any"
        },
        "parameters": [
          {
            "name": "name",
            "type": {
              "kind": "PrimitiveType",
              "type": "string"
            }
          }
        ]
      },
      {
        "kind": "Method",
        "name": "greet",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "() => string"
        },
        "parameters": [],
        "jsdoc": {
          "description": [
            "Abstract method to be implemented by subclasses. Must return a greeting message."
          ]
        }
      },
      {
        "kind": "Method",
        "name": "getName",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "() => string"
        },
        "parameters": [],
        "jsdoc": {
          "description": [
            "A public method accessible to instances of subclasses.\nThis method returns the name of the user."
          ]
        }
      }
    ]
  },
  {
    "kind": "Class",
    "name": "ConcreteUser",
    "isAbstract": false,
    "extends": "AbstractUser",
    "members": [
      {
        "kind": "Constructor",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "any"
        },
        "parameters": [
          {
            "name": "name",
            "type": {
              "kind": "PrimitiveType",
              "type": "string"
            }
          }
        ]
      },
      {
        "kind": "Method",
        "name": "greet",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "type": "() => string"
        },
        "parameters": [],
        "jsdoc": {
          "description": [
            "Implementation of the abstract greet method."
          ]
        }
      }
    ],
    "jsdoc": {
      "description": [
        "Concrete class extending an abstract class, implementing the required abstract method."
      ]
    }
  },
  {
    "kind": "Enum",
    "name": "TestLogLevel",
    "members": [
      {
        "name": "ERROR"
      },
      {
        "name": "WARN"
      },
      {
        "name": "INFO"
      },
      {
        "name": "DEBUG"
      }
    ]
  },
  {
    "kind": "Function",
    "name": "testFunctionUsingEnum",
    "parameters": [
      {
        "name": "level",
        "type": {
          "kind": "TypeReference",
          "name": "TestLogLevel"
        }
      },
      {
        "name": "message",
        "type": {
          "kind": "PrimitiveType",
          "type": "string"
        }
      }
    ],
    "returnType": {
      "kind": "PrimitiveType",
      "type": "void"
    },
    "jsdoc": {
      "description": [
        "Tests function parameter documentation using an enum, focusing on correct type linkage and\nvalue representation in logging functions."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "test-case"
        }
      ]
    }
  }
] as const