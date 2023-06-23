module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
		"airbnb-base",
		'plugin:import/recommended',
		'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  settings: {
    "import/resolver": {
      typescript: {}
    },
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "import/order": [
			"error",
			{
        "groups": [
          "builtin",
          "external",
          "internal",
          "unknown",
          "parent",
          "sibling",
          "index",
          "object",
          "type"
        ]
			}
		],
		"linebreak-style": "off",
		"import/extensions": "off",
		"@typescript-eslint/ban-ts-comment": "off",
		"import/prefer-default-export": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"no-console": "off",
		"import/no-cycle": "off",
		"no-return-await": "off",
		"consistent-return": "off",
		"no-param-reassign": "off",
		"class-methods-use-this": "off",
    "no-useless-constructor": "off",
    "import/no-extraneous-dependencies": "off"
  },
};
