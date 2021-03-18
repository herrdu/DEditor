module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    // 'eslint:recommended',
    '@vue/typescript/recommended',
    // '@vue/prettier',
    // '@vue/prettier/@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {vars: 'all', args: 'after-used', argsIgnorePattern: '^_'},
    ],
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': ['error', {allow: ['arrowFunctions']}],
    '@typescript-eslint/no-inferrable-types': 'off',
    // '@typescript-eslint/no-non-null-assertion': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint': {prefixWithI: 'never'},

    // 'prettier/prettier': ['error', {singleQuote: true}],
  },
};
