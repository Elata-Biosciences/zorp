const merge = require('lodash.merge');

/**
 * @see https://nextjs.org/docs/pages/building-your-application/deploying#static-html-export
 */
/** @type {import('next').NextConfig} */
const nextConfigDefaults = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

/**
 * @param {"phase-test"|"phase-development-server"|string} phase
 * @param {NextConfig} config
 *
 * @see https://nextjs.org/docs/pages/api-reference/config/next-config-js
 * @see https://github.com/nextjs/deploy-github-pages/blob/main/next.config.ts
 */
async function hook(phase, { nextConfigCustom }) {
	const nextConfig = merge({}, nextConfigDefaults, nextConfigCustom);
	console.log('START -- next.config.js -- hook(phase, { nextConfigCustom }) ->', { phase, nextConfigCustom, nextConfig });

	// Contract ABI files are committed to git and don't need to be copied during build
	console.log('Contract ABI files should already exist in src/lib/constants/wagmiContractConfig/');

	// Detect if deploying to GitHub Pages
	if (!!process.env.PAGES_BASE_PATH && process.env.PAGES_BASE_PATH.length) {
		console.warn('Assuming deployment to GitHub Pages');
		merge(nextConfig, {
			output: 'export',
			basePath: process.env.PAGES_BASE_PATH,
		});
	}
	// else if (!!process.env.VERCEL_TOKEN && process.env.VERCEL_TOKEN.length) {
	// 	console.warn('Assuming deployment to Vercel');
	// 	merge(nextConfig, {
	// 		output: 'export',
	// 		basePath: /* TOOD */,
	// 	});
	// }

	/**
	 * @see {@link https://nextjs.org/docs/messages/swc-disabled}
	 * TLDR: ignore `./babel.config.js` because be for satisfying test tooling
	 */
	nextConfig.experimental = {
		forceSwcTransforms: true,
	};

	if (phase === 'phase-test') {
		console.log('Detected phase is test');
		if (!nextConfig.transpilePackages || !Array.isArray(nextConfig.transpilePackages)) {
			nextConfig.transpilePackages = [];
		}
		nextConfig.transpilePackages.push( 'wagmi' );
	}

	console.log('END -- next.config.js -- hook(phase, { nextConfigCustom }) ->', { phase, nextConfigCustom, nextConfig });
	return nextConfig;
}

module.exports = hook;
