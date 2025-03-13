
import { BigNumber } from 'bignumber.js';
// import type { WebIrysOpts } from '@/@types/irys';

/**
 * @see https://arweave-tools.irys.xyz/overview/downloading
 */
export const gatewayUrl = {
	'arweave': 'https://arweave.net',
	'irys': 'https://gateway.irys.xyz',
} as const;

// TODO: define correct token, and other options too
export const webIrysOpts = {
	url: gatewayUrl.irys,
	wallet: {
		rpcUrl: 'https://devnet.irys.xyz/',
		// provider: new Error('Wallet provider required'),
	},
	// wallet?: {
	// 		rpcUrl?: string;
	// 		name?: string;
	// 		provider: object;
	// 		[key: string]: any;
	// };
	// url: 'https://devnet.irys.xyz/',
	// url: 'https://testnet-rpc.irys.xyz',
	token: 'base-eth',
} as const;

export const irysBalanceThreshold = BigNumber(0.1);
