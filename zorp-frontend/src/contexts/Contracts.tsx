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
	[key: string]: Contract | undefined;
	ZorpFactory: Contract | undefined;
	ZorpStudy: Contract | undefined;
};

// TODO: maybe find a less memory abusive way to satisfy MicroSoft™ TypeScript®
//       instead of copying each `abi`
const contractsAnvil: Contracts = {
	ZorpFactory: {
		address: config.anvil.contracts.ZorpFactory[31337].address,
		abi: Object.assign(config.anvil.contracts.ZorpFactory[31337].abi),
	},
	ZorpStudy: {
		address: config.anvil.contracts.ZorpStudy[31337].address,
		abi: Object.assign(config.anvil.contracts.ZorpStudy[31337].abi),
	}
};

const contractKeys = Object.keys(contractsAnvil);

export const ContractsContext = createContext<Contracts>(contractsAnvil);

type ProvidersProps = {
  children: JSX.Element | JSX.Element[] | string | null;
};

export function ContractsProvider({ children }: ProvidersProps) {
	const { chain, chainId, isConnected } = useAccount();
	const [contracts, setContracts] = useState(contractsAnvil);

	useEffect(() => {
		const assertsClient = {
			isChainKeyDefined: !!chain?.name.length,
			isChainIdDefined: !!chainId?.toString().length,
		};
		if (!Object.values(assertsClient).every(assert => assert)) {
			console.warn('ContractsProvider -- Waiting on all assertsClient to be true ->', {assertsClient, isConnected, chain, chainId});
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
	}, [ chain, chainId, isConnected ]);

	return (
		<ContractsContext.Provider value={contracts}>
			{children}
		</ContractsContext.Provider>
	);
}

export function useContracts() {
	return useContext(ContractsContext);
}
