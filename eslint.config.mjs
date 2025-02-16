import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import expectType from "eslint-plugin-expect-type/configs/recommended";

export default tseslint.config({
  files: ['**/*.js', '**/*.ts'],
  extends: [
    expectType,
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
  ],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    jsdoc,
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "no-trailing-spaces": 2,
    "eol-last": 2,
    "space-in-parens": ["error", "never"],
    "no-multiple-empty-lines": 1,
    "prefer-const": "error",
    "space-infix-ops": "error",
    "no-useless-escape": "off",
    "no-var": "error",
    "no-console": 0,
    "require-atomic-updates": "off",
    "prefer-spread": "off",
    "prefer-rest-params": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/triple-slash-reference": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "args": "all",
        "argsIgnorePattern": "^_",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_",
        "destructuredArrayIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true
      }
    ],
    "jsdoc/require-jsdoc": 0,
    "jsdoc/require-returns-description": 0,
    "jsdoc/require-param-description": 0,
    "jsdoc/require-property-description": 0,
    "jsdoc/require-param-type": 0,
    "jsdoc/tag-lines": 0,
    "jsdoc/check-param-names": [
      "error",
      {
        "allowExtraTrailingParamDocs": true
      }
    ],
    "jsdoc/no-undefined-types": [
      "error",
      {
        "definedTypes": [
          "AuthProvider",
          "AsyncStorage",
          "LocalDatastoreController",
          "Parse"
        ]
      }
    ]
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
    globals: {
      __dirname: true,
      beforeEach: true,
      Buffer: true,
      console: true,
      describe: true,
      fail: true,
      expect: true,
      global: true,
      it: true,
      jasmine: true,
      process: true,
      spyOn: true,
    },
  },
});
