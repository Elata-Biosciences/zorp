'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadStudyStatus() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	const { IZorpStudy } = useContracts();

	// Add null checks for IZorpStudy
	const contractAbi = IZorpStudy?.abi;

	const { data: study_status, isFetching } = useReadContract<
		typeof contractAbi,
		'study_status',
		[`0x${string}`],
		typeof config.wagmiConfig,
		bigint | 0 | 1 | 2
	>({
		abi: contractAbi || [],
		address: addressStudy,
		functionName: 'study_status',
		args: [],
		query: {
			enabled: !!contractAbi
						&& addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x'),
		},
	});

	// Show loading state if contracts aren't ready
	if (!IZorpStudy || !contractAbi) {
		return (
			<div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
				<h1 className="text-4xl font-bold mb-4">Zorp Study - Status</h1>
				<p className="text-gray-600 dark:text-gray-300 mb-4">
					Please connect your wallet to interact with the contracts.
				</p>
				<div className="mt-8">
					<ThemeSwitch />
				</div>
			</div>
		);
	}

	const getStatusText = (status: bigint | 0 | 1 | 2 | undefined) => {
		switch (status) {
			case 0: return 'Not Active';
			case 1: return 'Active';
			case 2: return 'Finished';
			default: return 'Unknown';
		}
	};

	const getStatusColor = (status: bigint | 0 | 1 | 2 | undefined) => {
		switch (status) {
			case 0: return 'text-gray-600';
			case 1: return 'text-green-600';
			case 2: return 'text-blue-600';
			default: return 'text-gray-400';
		}
	};

	return (
		<div className="w-full flex flex-col max-w-4xl mx-auto p-6">
			<h1 className="text-4xl font-bold text-center mb-8">
				Zorp Study - Status
			</h1>
			
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
				<ZorpStudyAddressInput
					disabled={isFetching}
					setState={setAddressStudy}
				/>

				<div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-md text-center">
					<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
						Study Status
					</h3>
					<div className="text-2xl font-bold">
						{isFetching ? (
							<span className="text-gray-500">Loading...</span>
						) : (
							<span className={getStatusColor(study_status)}>
								{getStatusText(study_status)}
							</span>
						)}
					</div>
					{study_status !== undefined && (
						<div className="mt-2 text-sm text-gray-500">
							Status Code: {study_status?.toString()}
						</div>
					)}
				</div>

				<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
					<h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
						Status Guide:
					</h4>
					<ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
						<li><strong>Not Active (0):</strong> Study has been created but not started</li>
						<li><strong>Active (1):</strong> Study is accepting data submissions</li>
						<li><strong>Finished (2):</strong> Study has ended, rewards can be claimed</li>
					</ul>
				</div>
			</div>

			<div className="fixed bottom-6 right-6">
				<ThemeSwitch />
			</div>
		</div>
	);
}
