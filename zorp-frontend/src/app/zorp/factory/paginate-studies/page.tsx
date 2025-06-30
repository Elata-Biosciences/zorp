'use client';

import { useCallback, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useZorpContract } from '@/contexts/Contracts';
import ContractStateWrapper from '@/components/contracts/ContractStateWrapper';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadPaginateSubmittedData() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [start, setStart] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);

	const startId = useId();
	const limitId = useId();

	const { abi, isReady } = useZorpContract('IZorpFactory');

	const { data: studyAddresses, isFetching, refetch } = useReadContract<
		typeof abi,
		'paginateStudies',
		[number, number],
		typeof config.wagmiConfig,
		Array<`0x${string}`>
	>({
		abi,
		address: addressFactory,
		functionName: 'paginateStudies',
		args: [start, limit],
		query: {
			enabled: false,
		},
	});

	const handleChangePaginateStart = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(event.target.value);
		if (!isNaN(value)) {
			setStart(value);
		}
	}, [ setStart ]);

	const handleChangePaginateLimit = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(event.target.value);
		if (!isNaN(value)) {
			setLimit(value);
		}
	}, [ setLimit ]);

	const handleClickPaginateRead = useCallback(async () => {
		const enabled: boolean = !isFetching
													&& isReady
													&& abi.length > 0
													&& addressFactory.length === addressFactoryAnvil.length
													&& addressFactory.startsWith('0x');

		if (!enabled) {
			console.warn('Missing required input(s) ->', {
				isReady,
				abi: abi.length,
				addressFactory,
				start,
				limit,
			});
			return;
		}

		await refetch();
	}, [
		addressFactoryAnvil,
		refetch,
		isFetching,
		isReady,
		abi,
		addressFactory,
		start,
		limit,
	]);

	return (
		<ContractStateWrapper contractName="IZorpFactory" title="Zorp Factory - Paginate Studies">
			<div className="w-full flex flex-col max-w-4xl mx-auto p-6">
				<h1 className="text-4xl font-bold text-center mb-8">
					Zorp Factory - Paginate Studies
				</h1>
				
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
					<ZorpFactoryAddressInput
						disabled={isFetching}
						setState={setAddressFactory}
					/>

					<div className="grid md:grid-cols-2 gap-4">
						<div>
							<label htmlFor={startId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Start Index:
							</label>
							<input
								id={startId}
								type="number"
								min="1"
								value={start}
								onChange={handleChangePaginateStart}
								disabled={isFetching}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>

						<div>
							<label htmlFor={limitId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Limit (max results):
							</label>
							<input
								id={limitId}
								type="number"
								min="1"
								max="50"
								value={limit}
								onChange={handleChangePaginateLimit}
								disabled={isFetching}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>
					</div>

					<div className="text-center">
						<button
							onClick={async (event) => {
								event.preventDefault();
								event.stopPropagation();
								await handleClickPaginateRead()
							}}
							disabled={isFetching || !isReady}
							className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
								isReady && !isFetching
									? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
									: 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
							}`}
						>
							{isFetching ? 'Loading...' : 'Get Study Addresses'}
						</button>
					</div>

					{/* Results Section */}
					<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
						<h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
							Study Addresses ({studyAddresses?.length || 0} found)
						</h3>
						
						{studyAddresses && studyAddresses.length > 0 ? (
							<div className="space-y-2 max-h-96 overflow-y-auto">
								{studyAddresses.map((address, i) => (
									<div
										key={`${i}-${address}`}
										className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500"
									>
										<div className="flex items-center space-x-3">
											<span className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-medium">
												{start + i}
											</span>
											<span className="font-mono text-sm break-all text-gray-800 dark:text-gray-200">
												{address}
											</span>
										</div>
										<button
											onClick={() => navigator.clipboard.writeText(address)}
											className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-500 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-400 transition-colors"
											title="Copy address"
										>
											Copy
										</button>
									</div>
								))}
							</div>
						) : studyAddresses?.length === 0 ? (
							<p className="text-gray-500 dark:text-gray-400 text-center py-4">
								No studies found in this range. Try a different start index or check if any studies exist.
							</p>
						) : (
							<p className="text-gray-500 dark:text-gray-400 text-center py-4">
								Click &quot;Get Study Addresses&quot; to load studies.
							</p>
						)}
					</div>

					<div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
						<p className="font-medium mb-2">💡 How to use:</p>
						<ul className="space-y-1 text-xs">
							<li>• <strong>Start Index:</strong> The position to begin listing studies (1 = first study)</li>
							<li>• <strong>Limit:</strong> Maximum number of studies to return (1-50)</li>
							<li>• <strong>Results:</strong> Study contract addresses you can interact with</li>
						</ul>
					</div>
				</div>

				<div className="fixed bottom-6 right-6">
					<ThemeSwitch />
				</div>
			</div>
		</ContractStateWrapper>
	);
}
