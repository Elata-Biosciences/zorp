/**
 * Because `wagmi` and/or `viet` and/or ReactJS and/or NextJS and/or Irys do not play well with on another
 *
 * @see {@link https://docs.irys.xyz/build/d/irys-in-the-browser#ethers-v6}
 */

import { useMemo } from 'react';
import { WebUploader } from "@irys/web-upload";
import { WebBaseEth } from '@irys/web-upload-ethereum';
import { EthersV6Adapter } from "@irys/web-upload-ethereum-ethers-v6";
import { BrowserProvider } from 'ethers';
import type { Account, Chain, Client, Transport } from 'viem';
import { type Config, useConnectorClient } from 'wagmi';

export function walletClientToIrysWebUploaderBaseEth(
	client: Client<Transport, Chain, Account>
) {
	const { chain, transport } = client;
	const network = {
		chainId: chain.id,
		name: chain.name,
		ensAddress: chain.contracts?.ensRegistry?.address,
	};
	const provider = new BrowserProvider(transport, network);
	return WebUploader(WebBaseEth).withAdapter(EthersV6Adapter(provider));
	/**
	 * @dev note the following methods be available but don't really seem to do anything
	 */
	// .withRpc('https://testnet-rpc.irys.xyz/v1/execution-rpc')
	// .mainnet();
	// .devnet();
	// TODO: maybe add `.withIrysConfig(config)` to the mix?
}

/** Hook to convert a viem Wallet Client to an Irys WebUploader for WebBaseEth. */
export function useIrysWebUploaderBuilderBaseEth({ chainId }: { chainId?: number } = {}) {
	const { data: client } = useConnectorClient<Config>({ chainId });
	return useMemo(
		() => (client ? walletClientToIrysWebUploaderBaseEth(client) : undefined),
		[client]
	);
}

