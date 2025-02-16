import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import expectType from 'eslint-plugin-expect-type/configs/recommended';

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
  },
  rules: {
    'no-empty': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
