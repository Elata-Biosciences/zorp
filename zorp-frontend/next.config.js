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
 * @param {any} phase
 * @param {NextConfig} config
 *
 * @see https://nextjs.org/docs/pages/api-reference/config/next-config-js
 * @see https://github.com/nextjs/deploy-github-pages/blob/main/next.config.ts
 */
async function hook(phase, { nextConfigCustom }) {
	const nextConfig = merge({}, nextConfigDefaults, nextConfigCustom);
	console.log('START -- next.config.js -- hook(phase, { nextConfigCustom }) ->', { phase, nextConfigCustom, nextConfig });

	/**
	 * @see https://d.sh/cli/getting-started
	 */
	const foundryResult = foundry({
		project: path.join(path.dirname(__dirname), 'zorp-contracts'),
		include: [
			'IZorpFactory.json',
			'IZorpStudy.json',
		],
	});
	const contractOutDir = path.join(__dirname, 'src', 'lib', 'constants', 'wagmiContractConfig');
	for (const contract of await foundryResult.contracts()) {
		const contractPathDest = path.join(contractOutDir, `${contract.name}.ts`);
		if (fs.existsSync(contractPathDest)) {
			console.warn(`Output contract config file already exists ->`, {contractPathDest});
			continue;
		}

		const contractOutputText = `export const ${contract.name} = ${JSON.stringify(contract, null, 2)} as const;`;
		fs.writeFileSync(contractPathDest, contractOutputText, { encoding: 'utf-8', mode: '440' });
	}

	// Copy select ABIs from `../zorp-contracts/out/` to `public/assets/abi/`
	//
	// Results in `../zorp-contracts/out/IZorpFactory.sol/IZorpFactory.json`
	//            `public/assets/abi/IZorpFactory.json`
	//            integration
	const abiOutDir = path.join(process.cwd(), 'public', 'assets', 'abi');
	if (!fs.existsSync(abiOutDir)) {
		fs.mkdirSync(abiOutDir, { recursive: true });
	}
	const abiNames = [ 'IZorpFactory', 'IZorpStudy' ];
	for (const abiName of abiNames) {
		const abiPathSource = path.join(path.dirname(process.cwd()), 'zorp-contracts', 'out', `${abiName}.sol`, `${abiName}.json`);
		const abiPathDest = path.join(abiOutDir, `${abiName}.json`);

		if (!fs.existsSync(abiPathSource)) {
			throw new Error(`Missing: ${abiPathSource}\n\tDid you forget -> forge build`);
		}
		if (fs.existsSync(abiPathDest)) {
			console.warn(`Output ABI file already exists ->`, {abiPathDest});
			continue;
		}

		fs.copyFileSync(abiPathSource, abiPathDest);
	}

	// Detect if deploying to GitHub Pages
	/** @type {string|undefined} */
	const PAGES_BASE_PATH = process.env.PAGES_BASE_PATH;
	if (!!PAGES_BASE_PATH && PAGES_BASE_PATH.length) {
		console.warn('Assuming deployment to GitHub Pages');
		merge(nextConfig, {
			output: 'export',
			basePath: PAGES_BASE_PATH,
		});
	}

	console.log('END -- next.config.js -- hook(phase, { nextConfigCustom }) ->', { phase, nextConfigCustom, nextConfig });
	return nextConfig;
}

module.exports = hook;
