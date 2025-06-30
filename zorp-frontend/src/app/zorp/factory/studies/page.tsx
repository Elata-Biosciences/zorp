'use client';

import { useCallback, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadStudyAddress() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [studyIndex, setStudyIndex] = useState<number>(1);

	const addressFactoryStudyIndexId = useId();

	const { IZorpFactory } = useContracts();

	// Add null checks for IZorpFactory
	const contractAbi = IZorpFactory?.abi;
	const contractAddress = IZorpFactory?.address;

	const enabled: boolean = !!contractAbi
												&& !!Object.keys(contractAbi).length
												&& !!contractAddress?.length
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x')
												&& !Number.isNaN(studyIndex)
												&& studyIndex > 0

	const { data: studyAddress, isFetching } = useReadContract<
		typeof contractAbi,
		'studies',
		[number],
		typeof config.wagmiConfig,
		`0x${string}`
	>({
		abi: contractAbi || [],
		address: addressFactory,
		functionName: 'studies',
		args: [studyIndex],
		query: {
			enabled,
		},
	});

	const handleChangeStudyIndex = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(event.target.value);
		if (!isNaN(value)) {
			setStudyIndex(value);
		}
	}, [ setStudyIndex ]);

	// Show loading state if contracts aren't ready
	if (!IZorpFactory || !contractAbi) {
		return (
			<div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
				<h1 className="text-4xl font-bold mb-4">Zorp Factory - Studies</h1>
				<p className="text-gray-600 dark:text-gray-300 mb-4">
					Please connect your wallet to interact with the contracts.
				</p>
				<div className="mt-8">
					<ThemeSwitch />
				</div>
			</div>
		);
	}

	return (
		<div className="w-full flex flex-col max-w-4xl mx-auto p-6">
			<h1 className="text-4xl font-bold text-center mb-8">
				Zorp Factory - Studies
			</h1>
			
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
				<ZorpFactoryAddressInput
					disabled={isFetching}
					setState={setAddressFactory}
				/>

				<div>
					<label htmlFor={addressFactoryStudyIndexId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						ZORP Study Index:
					</label>
					<input
						id={addressFactoryStudyIndexId}
						type="number"
						min="1"
						value={studyIndex}
						onChange={handleChangeStudyIndex}
						disabled={isFetching}
						className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
					/>
				</div>

				<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
					<h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Study Address:
					</h3>
					<div className="font-mono text-sm break-all">
						{isFetching ? (
							<span className="text-gray-500">Loading...</span>
						) : studyAddress ? (
							<span className="text-blue-600 dark:text-blue-400">{studyAddress}</span>
						) : (
							<span className="text-gray-500">No study found at index {studyIndex}</span>
						)}
					</div>
				</div>
			</div>

			<div className="fixed bottom-6 right-6">
				<ThemeSwitch />
			</div>
		</div>
	);
}
