// 'use client';

import { WebUploader } from "@irys/web-upload";
import { WebBaseEth } from '@irys/web-upload-ethereum';
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { ethers } from "ethers";
import * as openpgp from 'openpgp';
import * as irysConfig from '@/lib/constants/irysConfig';

/**
 * Because `wagmi` and/or `viet` and/or ReactJS and/or NextJS and/or Irys do not play well with on another
 *
 * @see {@link https://docs.irys.xyz/build/d/irys-in-the-browser#ethers-v6}
 */
export async function getIrysUploaderWebBaseEth() {
	if (!window.ethereum) {
		throw new Error('getIrysUploaderWebBaseEth -> failed to find `window.ethereum`');
	}

	const provider = new ethers.BrowserProvider(window.ethereum);

	return WebUploader(WebBaseEth).withAdapter(EthersV6Adapter(provider));

		/**
		 * @dev note the following methods be available but don't really seem to do anything
		 */
		// .withRpc('https://testnet-rpc.irys.xyz/v1/execution-rpc')
		// .mainnet();
		// .devnet();
		// TODO: maybe add `.withIrysConfig(config)` to the mix?
};

/**
 * Wrapper to aid mocked testing and reduce run-time boilerplate
 */
export async function getGpgKeyFromCid(cid: string) {
	const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;
	const response = await fetch(url);
	if (response.ok) {
		const text = await response.text();
		const key = await openpgp.readKey({ armoredKey: text });
		return { key, response };
	}

	return { response };
}
