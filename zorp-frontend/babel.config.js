/**
 * @see {@link https://medium.com/@neer.s/how-to-fix-jest-js-error-syntaxerror-unexpected-token-export-3ed6b4dde373}
 * @see {@link https://nextjs.org/docs/pages/building-your-application/configuring/babel}
 */
module.exports = {
	presets: [
		'next/babel',
		['@babel/preset-env', {targets: {node: 'current'}}],
		'@babel/preset-typescript',
	],
	plugins: [
		'@babel/plugin-proposal-export-default-from',
	]
};
