/** @type {import('prettier').Config} */
const config = {
	htmlWhitespaceSensitivity: 'ignore',
	useTabs: true,
	singleQuote: true,
	trailingComma: 'all',
	printWidth: 100,
	plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
	tailwindFunctions: ['cva'],
};

export default config;
