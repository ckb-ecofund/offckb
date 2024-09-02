module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['node_modules/'],
  rules: {
    // Other rules...
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    '@typescript-eslint/no-unused-vars': [
      'error', // or 'off' to disable entirely
      {
        argsIgnorePattern: '^_', // Ignore unused function arguments that start with an underscore
        varsIgnorePattern: '^_'   // Ignore unused variables that start with an underscore
      }
    ],
  }
};
