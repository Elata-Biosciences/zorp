// TODO: figure out why Anvil based testing fails

'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadPaginateSubmittedData() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>('0xa16E02E87b7454126E5E10d957A927A7F5B5d2be');
	const [start, setStart] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);

	const addressFactoryId = useId();
	const addressStudyId = useId();
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

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Paginate study data
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
			<input
				id={addressFactoryId}
				value={addressFactory}
				onChange={(event) => {
					setAddressFactory(event.target.value as `0x${string}`);
				}}
			/>

			<label htmlFor={addressStudyId}>ZORP Study Address:</label>
			<input
				id={addressStudyId}
				value={addressStudy}
				onChange={(event) => {
					setAddressStudy(event.target.value as `0x${string}`);
				}}
			/>

			<label htmlFor={startId}>Start</label>
			<input
				id={startId}
				type="number"
				min="1"
				value={start}
				onChange={(event) => {
					const value = Number.parseInt(event.target.value);
					if (!isNaN(value)) {
						setStart(value);
					}
				}}
				disabled={isFetching}
			/>

			<label htmlFor={limitId}>Limit</label>
			<input
				id={limitId}
				type="number"
				min="1"
				value={limit}
				onChange={(event) => {
					const value = Number.parseInt(event.target.value);
					if (!isNaN(value)) {
						setLimit(value);
					}
				}}
				disabled={isFetching}
			/>

			<button
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();

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

					refetch();
				}}
				disabled={isFetching}
			>Get Study Addresses</button>

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

