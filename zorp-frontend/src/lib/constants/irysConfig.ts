
import { BigNumber } from 'bignumber.js';

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
	},
	// url: 'https://devnet.irys.xyz/',
	// url: 'https://testnet-rpc.irys.xyz',
	token: 'base-eth',
} as const;

export const irysThreshold = {
	/**
	 * 2025-03-15 docs says 100 KiB or less are free to upload, 1024 bytes per KiB
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob/size}
	 * @see {@link https://docs.irys.xyz/build/d/sdk/upload/upload#funding}
	 */
	fileSizeMaxFree: 102400,

	/**
	 * When file size is greater than `fileSizeMaxFree` it is recommended to have
	 * at least some funds to pay for uploads
	 *
	 * @see {@link https://docs.irys.xyz/build/d/sdk/payment/fund}
	 */
	minimumBalance: BigNumber(0.1),
} as const;
