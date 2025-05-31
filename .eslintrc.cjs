/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte'],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
		},
		//Skip this validation for generated OpenAPI My Account types, as it has duplicates for api paths that are not a problem
		{
			files: ['src/lib/open-api/myaccount/my-account-api-schema.types.generated.ts'],
			rules: {
				'@typescript-eslint/no-duplicate-enum-values': 'off',
			},
		},
	],
};
