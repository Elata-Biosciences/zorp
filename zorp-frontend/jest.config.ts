/**
 * @see {@link https://github.com/jsdom/jsdom/issues/2524}
 * @see {@link https://github.com/jsdom/jsdom/pull/3791}
 * @see {@link https://github.com/nodejs/node/issues/40091}
 * @see {@link https://github.com/openpgpjs/openpgpjs/issues/1199}
 * @see {@link https://github.com/openpgpjs/openpgpjs/issues/1199}
 * @see {@link https://github.com/vercel/next.js/discussions/31152#discussioncomment-1697047}
 * @see {@link https://github.com/vercel/next.js/discussions/43591}
 * @see {@link https://jestjs.io/docs/ecmascript-modules}
 * @see {@link https://jestjs.io/docs/es6-class-mocks}
 * @see {@link https://jestjs.io/docs/getting-started#using-typescript}
 * @see {@link https://jestjs.io/docs/next/configuration#extensionstotreatasesm-arraystring}
 * @see {@link https://jestjs.io/docs/next/ecmascript-modules}
 * @see {@link https://nextjs.org/docs/app/building-your-application/testing/jest}
 * @see {@link https://stackoverflow.com/questions/56806193/jest-syntaxerror-unexpected-token}
 */

import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
	dir: './',
});

const config: Config = {
	coverageProvider: 'v8',
	transform: {
		'^.+\\.(js|jsx)$': ['babel-jest', { presets: ['next/babel'] }],
		// '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
		"^.+\.tsx?$": ["ts-jest", { tsconfig: 'tsconfig.jest.json' }],
	},
	transformIgnorePatterns: [
		'/node_modules',
		'^.+\\.module\\.(css|sass|scss)$',
	],
	extensionsToTreatAsEsm: [
		'.jsx',
		'.ts',
		'.tsx',
	],
	moduleNameMapper: {
		'^@irys/sdk$': require.resolve('@irys/sdk'),
		'^@irys/query$': require.resolve('@irys/query'),
		'^arbundles$': require.resolve('arbundles'),
		'^uuid$': require.resolve('uuid'),
		// '^wagmi$': require.resolve('wagmi'),
	},
	// testEnvironment: "node",
	// testEnvironment: 'jsdom',
	testEnvironment: '<rootDir>/.jest/env-jsdom.ts',
};

export default createJestConfig(config);
