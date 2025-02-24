const merge = require('lodash.merge');
const fs = require('fs');
const process = require('process');
const path = require('path');

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
 */
async function hook(phase, { nextConfigCustom }) {
	const nextConfig = merge({}, nextConfigDefaults, nextConfigCustom);
	console.log('next.config.js -- hook(phase, { nextConfigCustom }) ->', { phase, nextConfigCustom, nextConfig });

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

	return nextConfig;
}

module.exports = hook;
