'use client';
/**
 * @file React-ive wrapper for accessing `wagmiConfig` contracts when client wallet changes chain
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { JSX } from 'react';
import merge from 'lodash.merge';
import { useAccount } from 'wagmi';
import * as config from '@/lib/constants/wagmiConfig';

type Contract = {
	address: `0x${string}`;
	readonly abi: {
		[key: string]: {
			readonly type: string;
			readonly name: string;
			readonly inputs: {
				readonly name: string;
				readonly type: string;
				readonly internalType: string;
			}[];
			readonly outputs: {
				readonly name: string;
				readonly type: string;
				readonly internalType: string;
			}[];
			readonly stateMutability: string;
		}
	}[];
};
type Contracts = {
	[key: string]: Contract;
	IZorpFactory: Contract;
	IZorpStudy: Contract;
};

// TODO: maybe find a less memory abusive way to satisfy MicroSoft™ TypeScript®
//       instead of copying each `abi`
const contractsAnvil: Contracts = {
	IZorpFactory: {
		address: config.anvil.contracts.IZorpFactory[31337].address,
		abi: Object.assign(config.anvil.contracts.IZorpFactory[31337].abi),
	},
	IZorpStudy: {
		address: config.anvil.contracts.IZorpStudy[31337].address,
		abi: Object.assign(config.anvil.contracts.IZorpStudy[31337].abi),
	}
};

const contractKeys = Object.keys(contractsAnvil);

export const ContractsContext = createContext<Contracts>(contractsAnvil);

type ProvidersProps = {
  children: JSX.Element | JSX.Element[] | string | null;
};

/**
 * @TODO maybe find a way to allow view/read even when `useAccount` isn't connected
 */
export function ContractsProvider({ children }: ProvidersProps) {
	const { chain, chainId } = useAccount();
	const [contracts, setContracts] = useState(contractsAnvil);

	useEffect(() => {
		const assertsClient = {
			isChainKeyDefined: !!chain?.name.length,
			isChainIdDefined: !!chainId?.toString().length,
		};
		if (!Object.values(assertsClient).every(assert => assert)) {
			console.warn('ContractsProvider -- Waiting on all assertsClient to be true ->', {assertsClient, chain, chainId});
			return;
		}

		const configChain = config.wagmiConfig.chains.find((chainData) => {
			return !!chainData?.name.length && chainData.name == chain?.name;
		});
		if (!configChain || !Object.keys(configChain).length) {
			console.error('ContractsProvider -- No configChain found for chain name ->', chain?.name);
			return
		}

		const updatedContracts = merge({}, contractsAnvil);
		for (const key of contractKeys) {
			// Hey MicroSoft™ TypeScript®...  _thank_ you for this!
			const contractData = (configChain.contracts as {
				[key: string]: {
					[key: number]: Contract
				} | undefined
			})[key];

			if (!contractData || !Object.keys(contractData).length) {
				console.error(`ContractsProvider -- Contract "${key}" not found for chain name ->`, chain?.name);
				return;
			}

			// TODO: maybe replace `chainId` with `sourceId` when related
			//       `zorp-frontend/src/lib/constants/wagmiConfig.ts` to-do is done
			updatedContracts[key] = contractData[chainId as number];
		}

		setContracts(updatedContracts);
		console.warn('ContractsProvider -- Finished updating contrac data ->', {assertsClient, chain, chainId, updatedContracts});
	}, [ chain, chainId ]);

	return (
		<ContractsContext.Provider value={contracts}>
			{children}
		</ContractsContext.Provider>
	);
}

export function useContracts() {
	const context = useContext(ContractsContext);
	if (context == null) {
		throw new Error('ContractsContext has not been Provided?!');
	}
	return context;
}
