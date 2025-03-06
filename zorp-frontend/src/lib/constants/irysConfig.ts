
import { BigNumber } from 'bignumber.js';
import type { WebIrysOpts } from '@/@types/irys';

/**
 * @see https://arweave-tools.irys.xyz/overview/downloading
 */
export const gatewayUrl = {
	'arweave': 'https://arweave.net',
	'irys': 'https://gateway.irys.xyz',
} as const;

// TODO: define correct token, and other options too
export const webIrysOpts: WebIrysOpts = {
	token: 'WAT'
} as const;

export const irysBalanceThreshold = BigNumber(0.1);
