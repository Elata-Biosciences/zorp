// TODO: figure out why Anvil based testing fails

'use client';

import { useCallback, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadPaginateSubmittedData() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>('0xa16E02E87b7454126E5E10d957A927A7F5B5d2be');
	const [start, setStart] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);

	const startId = useId();
	const limitId = useId();

	const { IZorpFactory } = useContracts();

	const { data: cids, isFetching, refetch } = useReadContract({
		abi: IZorpFactory.abi,
		address: IZorpFactory.address,
		functionName: 'paginateSubmittedData',
		args: [addressStudy, start, limit],
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
		const enabled = !isFetching
									&& addressFactory.length === addressFactoryAnvil.length
									&& addressFactory.startsWith('0x')
									&& addressStudy.length === addressFactoryAnvil.length
									&& addressStudy.startsWith('0x')
									&& !!IZorpFactory?.abi
									&& !!Object.keys(IZorpFactory.abi).length
									&& !!IZorpFactory?.address.length;

		if (!enabled) {
			console.warn('Missing required input(s) ->', {
				addressFactory,
				addressStudy,
				start,
				limit,
			});
			return;
		}

		await refetch();
	}, [
		IZorpFactory,
		addressFactory,
		addressFactoryAnvil,
		addressStudy,
		isFetching,
		limit,
		refetch,
		start,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Paginate study data
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpFactoryAddressInput
				disabled={isFetching}
				setState={setAddressFactory}
			/>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
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
					await handleClickPaginateRead();
				}}
				disabled={isFetching}
			>Get Study CIDs</button>

			<section>
				<header>Study CIDs</header>
				<ul>
					{ (cids as `0x${string}`[])?.map((cid, i) => {
						return (
							<li key={`${i}-${cid}`}>
								{i + start} --
								{!!cid.length ? cid : 'null'}
							</li>
						);
					}) }
				</ul>
			</section>
		</div>
	);
}

