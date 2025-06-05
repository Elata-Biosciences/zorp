'use client';

import { useCallback, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
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

	const { IZorpFactory } = useContracts();

	const { data: studyAddresses, isFetching, refetch } = useReadContract<
		typeof IZorpFactory.abi,
		'paginateStudies',
		[number, number],
		typeof config.wagmiConfig,
		Array<`0x${string}`>
	>({
		abi: IZorpFactory.abi,
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
													&& !!IZorpFactory?.abi
													&& !!Object.keys(IZorpFactory.abi).length
													&& !!IZorpFactory?.address.length
													&& addressFactory.length === addressFactoryAnvil.length
													&& addressFactory.startsWith('0x');

		if (!enabled) {
			console.warn('Missing required input(s) ->', {
				IZorpFactory,
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
		IZorpFactory,
		addressFactory,
		start,
		limit,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Paginate studies
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<hr />

			<ZorpFactoryAddressInput
				disabled={isFetching}
				setState={setAddressFactory}
			/>

			<label htmlFor={startId}>Start</label>
			<input
				id={startId}
				type="number"
				min="1"
				value={start}
				onChange={handleChangePaginateStart}
				disabled={isFetching}
			/>

			<label htmlFor={limitId}>Limit</label>
			<input
				id={limitId}
				type="number"
				min="1"
				value={limit}
				onChange={handleChangePaginateLimit}
				disabled={isFetching}
			/>

			<button
				onClick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					await handleClickPaginateRead()
				}}
				disabled={isFetching}
			>Get Study Addresses</button>

			<section>
				<header>Study addresses</header>
				<ul>
					{ (studyAddresses as `0x${string}`[])?.map((address, i) => {
						return <li key={`${i}-${address}`}>{address}</li>;
					}) }
				</ul>
			</section>
		</div>
	);
}
