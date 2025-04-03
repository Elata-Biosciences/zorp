const merge = require('lodash.merge');
const fs = require('fs');
const process = require('process');
const path = require('path');
const { foundry } = require('@wagmi/cli/plugins');

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

	/**
	 * Copy and transmute contract ABI JSON files from `../zorp-contracts/out/`
	 * to `./src/lib/constants/wagmiContractConfig/`
	 */
	const abiNames = [ 'IZorpFactory', 'IZorpStudy' ];
	const abiPathSourceDir = path.join(path.dirname(process.cwd()), 'zorp-contracts', 'out');
	const contractOutDir = path.join(__dirname, 'src', 'lib', 'constants', 'wagmiContractConfig');
	for (const abiName of abiNames) {
		const abiPathSource = path.join(abiPathSourceDir, `${abiName}.sol`, `${abiName}.json`);
		if (!fs.existsSync(abiPathSource)) {
			console.error(`Source ABI file does not exists ->`, {abiPathSource});
			continue;
		}

		const contractPathDest = path.join(contractOutDir, `${abiName}.ts`);
		if (fs.existsSync(contractPathDest)) {
			console.warn(`Output contract config file already exists ->`, {contractPathDest});
			continue;
		}

		console.log('Coping contract ABI', {
			path_source: abiPathSource,
			path_destination: contractPathDest,
		});
		const contractJson = JSON.parse(fs.readFileSync(abiPathSource, 'utf8'));
		const contractData = {
			abi: contractJson.abi,
		};
		// TODO: if contract sizes become really large, consider filtering
		//       unnecessary bits, such as doc-comments, around here
		const contractOutputText = `export const ${abiName} = ${JSON.stringify(contractData, null, 2)} as const;`;
		fs.writeFileSync(contractPathDest, contractOutputText, { encoding: 'utf-8', mode: '440' });
	}

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
