
/**
 * @see @irys/sdk/build/cjs/common/types.d.ts
 */
export type WebIrysOpts = {
	url?: string;
	network?: Network;
	token: string;
	wallet?: {
			rpcUrl?: string;
			name?: string;
			provider: object;
	};
	config?: IrysConfig;
}

