module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['standard-with-typescript', 'plugin:react/recommended', 'prettier'],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    'react/prop-types': 'off',
    'no-useless-return': 'off',
    'no-extra-boolean-cast': 'off'
  },
  ignorePatterns: ['node_modules', 'dist']
};
