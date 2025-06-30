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

type ContractsContextValue = {
	contracts: Contracts | null;
	isLoading: boolean;
	error: string | null;
	chainId: number | null;
	chainName: string | null;
	isReady: boolean;
};

// Default contracts (Anvil/local)
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

const defaultContextValue: ContractsContextValue = {
	contracts: null,
	isLoading: true,
	error: null,
	chainId: null,
	chainName: null,
	isReady: false,
};

export const ContractsContext = createContext<ContractsContextValue>(defaultContextValue);

type ProvidersProps = {
  children: JSX.Element | JSX.Element[] | string | null;
};

export function ContractsProvider({ children }: ProvidersProps) {
	const { chain, chainId, isConnected } = useAccount();
	const [contracts, setContracts] = useState<Contracts | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Reset states when wallet changes
		setIsLoading(true);
		setError(null);

		// If no wallet connected, use default Anvil contracts
		if (!isConnected || !chain || !chainId) {
			console.log('ContractsProvider: No wallet connected, using Anvil defaults');
			setContracts(contractsAnvil);
			setIsLoading(false);
			return;
		}

		try {
			// Find the matching chain configuration
			const configChain = config.wagmiConfig.chains.find((chainData) => {
				return chainData.id === chainId;
			});

			if (!configChain) {
				const supportedChains = config.wagmiConfig.chains.map(c => `${c.name} (${c.id})`).join(', ');
				const errorMsg = `Unsupported chain "${chain.name}" (${chainId}). Supported chains: ${supportedChains}`;
				console.error('ContractsProvider:', errorMsg);
				setError(errorMsg);
				setContracts(null);
				setIsLoading(false);
				return;
			}

			// Build contracts for this chain
			const updatedContracts = merge({}, contractsAnvil);
			let hasAllContracts = true;

			for (const key of contractKeys) {
				const contractData = (configChain.contracts as {
					[key: string]: {
						[key: number]: Contract
					} | undefined
				})[key];

				if (!contractData || !contractData[chainId]) {
					console.error(`ContractsProvider: Contract "${key}" not found for chain "${chain.name}" (${chainId})`);
					hasAllContracts = false;
					break;
				}

				updatedContracts[key] = contractData[chainId];
			}

			if (!hasAllContracts) {
				setError(`Some contracts are not deployed on ${chain.name}. Please switch to a supported network.`);
				setContracts(null);
			} else {
				console.log(`ContractsProvider: Successfully loaded contracts for ${chain.name} (${chainId})`);
				setContracts(updatedContracts);
				setError(null);
			}
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Unknown error loading contracts';
			console.error('ContractsProvider: Error loading contracts:', err);
			setError(errorMsg);
			setContracts(null);
		} finally {
			setIsLoading(false);
		}
	}, [chain, chainId, isConnected]);

	const contextValue: ContractsContextValue = {
		contracts,
		isLoading,
		error,
		chainId: chainId ?? null,
		chainName: chain?.name || null,
		isReady: !isLoading && !error && !!contracts,
	};

	return (
		<ContractsContext.Provider value={contextValue}>
			{children}
		</ContractsContext.Provider>
	);
}

export function useContracts() {
	const context = useContext(ContractsContext);
	if (context === undefined) {
		throw new Error('useContracts must be used within a ContractsProvider');
	}
	return context;
}

// Safe hook for individual contracts with proper loading states
export function useZorpContract(contractName: 'IZorpFactory' | 'IZorpStudy') {
	const { contracts, isLoading, error, chainId, chainName, isReady } = useContracts();
	
	const contract = contracts?.[contractName];
	
	return {
		contract,
		abi: contract?.abi || [],
		address: contract?.address,
		isLoading,
		error,
		chainId,
		chainName,
		isReady: isReady && !!contract?.abi?.length,
		// Convenience booleans
		hasContract: !!contract,
		hasAbi: !!contract?.abi?.length,
	};
}
