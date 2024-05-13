import type {Type} from "@bigmistqke/readmi";
export default [
  {
    "kind": "TypeAlias",
    "name": "TupleType",
    "jsdoc": {
      "description": [
        "Represents a simple tuple of string literals."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "tuple-example"
        }
      ]
    },
    "typeAnnotation": {
      "kind": "Tuple",
      "literal": "TupleType",
      "types": [
        {
          "kind": "PrimitiveType",
          "literal": "\"hello\""
        },
        {
          "kind": "PrimitiveType",
          "literal": "\"world\""
        }
      ]
    },
    "literal": "TupleType = [\n    \"hello\",\n    \"world\"\n];"
  },
  {
    "kind": "TypeAlias",
    "name": "TupleTypeWithGeneric",
    "jsdoc": {
      "description": [
        "Defines a tuple type that incorporates a generic type parameter.\nThis allows the tuple to hold a value of any specified type."
      ],
      "tags": [
        {
          "tagName": "tag",
          "comment": "tuple-with-generic"
        }
      ]
    },
    "generics": [
      {
        "name": "T"
      }
    ],
    "typeAnnotation": {
      "kind": "Tuple",
      "literal": "TupleTypeWithGeneric<T>",
      "types": [
        {
          "kind": "TypeReference",
          "name": "T"
        }
      ]
    },
    "literal": "TupleTypeWithGeneric<T> = [\n    T\n];"
  },
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
    "literal": "testSimpleNumericType: number",
    "typeAnnotation": {
      "kind": "PrimitiveType",
      "literal": "number"
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
          "literal": "string"
        },
        {
          "tagName": "property",
          "comment": "Validates boolean type parsing.",
          "name": "isActive",
          "literal": "boolean"
        }
      ]
    },
    "literal": "testObjectWithJSDocProperties: {\n    id: string;\n    isActive: boolean;\n}",
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "literal": "{ id: string; isActive: boolean; }",
      "members": [
        {
          "name": "id",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "string"
          },
          "jsdoc": {
            "description": [
              "Ensures string types are handled correctly."
            ]
          }
        },
        {
          "name": "isActive",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "boolean"
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
    "literal": "testObjectWithInlinedJSDoc: {\n    name: string;\n    price: number;\n}",
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "literal": "{ name: string; price: number; }",
      "members": [
        {
          "name": "name",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "string"
          },
          "jsdoc": {
            "description": [
              "Describes the name of a product"
            ]
          }
        },
        {
          "name": "price",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "number"
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
    "kind": "TypeAlias",
    "name": "ObjectTypeWithGeneric",
    "jsdoc": {
      "description": [
        "Tests type with generic"
      ]
    },
    "generics": [
      {
        "name": "T"
      }
    ],
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "literal": "ObjectTypeWithGeneric<T>",
      "members": [
        {
          "name": "id",
          "typeAnnotation": {
            "kind": "TypeReference",
            "name": "T"
          },
          "jsdoc": {
            "description": [
              "Property id is of type T"
            ]
          }
        }
      ]
    },
    "literal": "ObjectTypeWithGeneric<T> = {\n    id: T;\n};"
  },
  {
    "kind": "Variable",
    "name": "testObjectWithGeneric",
    "literal": "testObjectWithGeneric: ObjectTypeWithGeneric<string>",
    "typeAnnotation": {
      "kind": "TypeReference",
      "name": "ObjectTypeWithGeneric",
      "parameters": [
        {
          "kind": "PrimitiveType",
          "literal": "string"
        }
      ]
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
          "literal": "string"
        },
        {
          "tagName": "property",
          "comment": "Specifies the price of the product, demonstrating how numeric types are documented.",
          "name": "price",
          "literal": "number"
        },
        {
          "tagName": "property",
          "comment": "Ensures string types are handled correctly through explicit JSDoc tags.",
          "name": "id",
          "literal": "string"
        },
        {
          "tagName": "property",
          "comment": "Validates boolean type parsing with explicit JSDoc tags.",
          "name": "isActive",
          "literal": "boolean"
        }
      ]
    },
    "literal": "testCombinedObjectJSDoc: {\n    name: string;\n    price: number;\n    id: string;\n    isActive: boolean;\n}",
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "literal": "{ name: string; price: number; id: string; isActive: boolean; }",
      "members": [
        {
          "name": "name",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "string"
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
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "number"
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
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "string"
          },
          "jsdoc": {
            "description": [
              "Ensures string types are handled correctly through explicit JSDoc tags."
            ]
          }
        },
        {
          "name": "isActive",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "boolean"
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
    "kind": "Variable",
    "name": "destructuringProperty",
    "jsdoc": {
      "description": [
        "Tests destructuring assignments where the object being destructured has its own JSDoc comments.\nVerifies whether the comments are maintained or lost upon destructuring."
      ]
    },
    "literal": "destructuringProperty: string",
    "typeAnnotation": {
      "kind": "PrimitiveType",
      "literal": "string"
    }
  },
  {
    "kind": "TypeAlias",
    "name": "Product",
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "literal": "Product",
      "members": [
        {
          "name": "name",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "string"
          },
          "jsdoc": {
            "description": [
              "Documents a product's name within a type alias"
            ]
          }
        },
        {
          "name": "price",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "number"
          },
          "jsdoc": {
            "description": [
              "Documents a product's price within a type alias"
            ]
          }
        }
      ]
    },
    "literal": "Product = {\n    name: string;\n    price: number;\n};"
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
    "literal": "testProductTypeAlias: Product",
    "typeAnnotation": {
      "kind": "TypeReference",
      "name": "Product"
    }
  },
  {
    "kind": "Function",
    "name": "testCreatingSimpleObject",
    "arguments": [],
    "returnType": {
      "kind": "TypeLiteral",
      "literal": "{ property: string; }",
      "members": [
        {
          "name": "property",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "string"
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
          "literal": "SimpleObject"
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
    "literal": "testGenericTypeInference: <T>(value: T) => T",
    "typeAnnotation": {
      "kind": "FunctionType",
      "literal": "<T>(value: T) => T",
      "arguments": [
        {
          "name": "value",
          "typeAnnotation": {
            "kind": "TypeReference",
            "name": "T"
          }
        }
      ],
      "returnType": {
        "kind": "TypeReference",
        "name": "T"
      },
      "generics": [
        {
          "name": "T"
        }
      ]
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
    "literal": "testFunctionWithComplexParams: (config: {\n    key: string;\n    value: number;\n    callback: (userInfo: {\n        name: string;\n        age: number;\n    }, settings: Settings) => void;\n}, settings: Settings) => void",
    "typeAnnotation": {
      "kind": "FunctionType",
      "literal": "(config: { key: string; value: number; callback: (userInfo: { name: string; age: number; }, settings: Settings) => void; }, settings: Settings) => void",
      "arguments": [
        {
          "name": "config",
          "typeAnnotation": {
            "kind": "TypeLiteral",
            "literal": "{ key: string; value: number; callback: (userInfo: { name: string; age: number; }, settings: Settings) => void; }",
            "members": [
              {
                "name": "key",
                "typeAnnotation": {
                  "kind": "PrimitiveType",
                  "literal": "string"
                },
                "jsdoc": {
                  "description": [
                    "Key in the configuration object"
                  ]
                }
              },
              {
                "name": "value",
                "typeAnnotation": {
                  "kind": "PrimitiveType",
                  "literal": "number"
                },
                "jsdoc": {
                  "description": [
                    "Value associated with the key"
                  ]
                }
              },
              {
                "name": "callback",
                "typeAnnotation": {
                  "kind": "FunctionType",
                  "literal": "(userInfo: { name: string; age: number; }, settings: Settings) => void",
                  "arguments": [
                    {
                      "name": "userInfo",
                      "typeAnnotation": {
                        "kind": "TypeLiteral",
                        "literal": "{ name: string; age: number; }",
                        "members": [
                          {
                            "name": "name",
                            "typeAnnotation": {
                              "kind": "PrimitiveType",
                              "literal": "string"
                            },
                            "jsdoc": {
                              "description": [
                                "Name of the user"
                              ]
                            }
                          },
                          {
                            "name": "age",
                            "typeAnnotation": {
                              "kind": "PrimitiveType",
                              "literal": "number"
                            },
                            "jsdoc": {
                              "description": [
                                "Age of the user"
                              ]
                            }
                          }
                        ]
                      }
                    },
                    {
                      "name": "settings",
                      "typeAnnotation": {
                        "kind": "TypeReference",
                        "name": "Settings"
                      }
                    }
                  ],
                  "returnType": {
                    "kind": "PrimitiveType",
                    "literal": "void"
                  }
                },
                "jsdoc": {
                  "tags": [
                    {
                      "tagName": "param",
                      "comment": "User details.",
                      "name": "userInfo",
                      "literal": "{ name: string, age: number }"
                    },
                    {
                      "tagName": "param",
                      "comment": "User specific settings.",
                      "name": "settings",
                      "literal": "Settings"
                    }
                  ],
                  "description": [
                    "Callback function within the configuration object."
                  ]
                }
              }
            ]
          }
        },
        {
          "name": "settings",
          "typeAnnotation": {
            "kind": "TypeReference",
            "name": "Settings"
          }
        }
      ],
      "returnType": {
        "kind": "PrimitiveType",
        "literal": "void"
      }
    }
  },
  {
    "kind": "Function",
    "name": "testTraditionalFunctionSyntax",
    "arguments": [
      {
        "name": "config",
        "jsdoc": {
          "description": [
            "Inlined jsdoc comment for config"
          ]
        },
        "typeAnnotation": {
          "kind": "TypeLiteral",
          "literal": "{ key: string; value: number; }",
          "members": [
            {
              "name": "key",
              "typeAnnotation": {
                "kind": "PrimitiveType",
                "literal": "string"
              },
              "jsdoc": {
                "description": [
                  "Inlined jsdoc comment for key"
                ]
              }
            },
            {
              "name": "value",
              "typeAnnotation": {
                "kind": "PrimitiveType",
                "literal": "number"
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
        "typeAnnotation": {
          "kind": "TypeReference",
          "name": "Settings"
        }
      }
    ],
    "returnType": {
      "kind": "PrimitiveType",
      "literal": "void"
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
    },
    "typeAnnotation": {
      "kind": "TypeLiteral",
      "literal": "Settings",
      "members": [
        {
          "name": "theme",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "string"
          },
          "jsdoc": {
            "description": [
              "Theme setting of the application"
            ]
          }
        },
        {
          "name": "layout",
          "typeAnnotation": {
            "kind": "PrimitiveType",
            "literal": "string"
          },
          "jsdoc": {
            "description": [
              "Layout setting of the application"
            ]
          }
        }
      ]
    },
    "literal": "Settings = {\n    theme: string;\n    layout: string;\n};"
  },
  {
    "kind": "Class",
    "name": "TestClassWithPropertiesAndMethods",
    "isAbstract": false,
    "members": [
      {
        "kind": "Property",
        "name": "firstName",
        "jsdoc": {
          "description": [
            "Publicly accessible first name of the user"
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "string"
        }
      },
      {
        "kind": "Constructor",
        "jsdoc": {
          "description": [
            "Constructor that initializes user details."
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "any"
        },
        "parameters": []
      },
      {
        "kind": "Method",
        "name": "greet",
        "jsdoc": {
          "description": [
            "Method that greets the user, demonstrating return type documentation."
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "() => string"
        },
        "parameters": []
      },
      {
        "kind": "Property",
        "name": "logDetails",
        "jsdoc": {
          "description": [
            "A private method demonstrating privacy within classes.\nThis method logs a private message."
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "any"
        },
        "accessModifier": "private"
      },
      {
        "kind": "Method",
        "name": "getDetails",
        "jsdoc": {
          "description": [
            "A protected method showing how protected members are handled.\nThis method returns the details in a formatted string."
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "() => string"
        },
        "parameters": [],
        "accessModifier": "protected"
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
        "jsdoc": {
          "description": [
            "The name of the user"
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "string"
        }
      },
      {
        "kind": "Constructor",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "any"
        },
        "parameters": [
          {
            "name": "name",
            "typeAnnotation": {
              "kind": "PrimitiveType",
              "literal": "string"
            }
          }
        ]
      },
      {
        "kind": "Method",
        "name": "greet",
        "jsdoc": {
          "description": [
            "Abstract method to be implemented by subclasses. Must return a greeting message."
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "() => string"
        },
        "parameters": []
      },
      {
        "kind": "Method",
        "name": "getName",
        "jsdoc": {
          "description": [
            "A public method accessible to instances of subclasses.\nThis method returns the name of the user."
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "() => string"
        },
        "parameters": []
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
          "literal": "any"
        },
        "parameters": [
          {
            "name": "name",
            "typeAnnotation": {
              "kind": "PrimitiveType",
              "literal": "string"
            }
          }
        ]
      },
      {
        "kind": "Method",
        "name": "greet",
        "jsdoc": {
          "description": [
            "Implementation of the abstract greet method."
          ]
        },
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "() => string"
        },
        "parameters": []
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
        "name": "ERROR",
        "value": 0,
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "number"
        }
      },
      {
        "name": "WARN",
        "value": 1,
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "number"
        }
      },
      {
        "name": "INFO",
        "value": 2,
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "number"
        }
      },
      {
        "name": "DEBUG",
        "value": 3,
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "number"
        }
      }
    ]
  },
  {
    "kind": "Function",
    "name": "testFunctionUsingEnum",
    "arguments": [
      {
        "name": "level",
        "typeAnnotation": {
          "kind": "TypeReference",
          "name": "TestLogLevel"
        }
      },
      {
        "name": "message",
        "typeAnnotation": {
          "kind": "PrimitiveType",
          "literal": "string"
        }
      }
    ],
    "returnType": {
      "kind": "PrimitiveType",
      "literal": "void"
    }
  }
] as const satisfies Type[]