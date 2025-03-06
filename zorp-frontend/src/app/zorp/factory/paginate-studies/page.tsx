'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';

export default function ZorpFactoryReadPaginateSubmittedData() {
	const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [start, setStart] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);

	const addressFactoryId = useId();
	const startId = useId();
	const limitId = useId();

	const { ZorpFactory } = useContracts();

	const { data: studyAddresses, isFetching, refetch } = useReadContract({
		abi: (ZorpFactory as NonNullable<typeof ZorpFactory>).abi,
		address: (ZorpFactory as NonNullable<typeof ZorpFactory>).address,
		functionName: 'paginateStudies',
		args: [start, limit],
		query: {
			enabled: false,
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Paginate studies
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<hr />
			<label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
			<input
				id={addressFactoryId}
				value={addressFactory}
				onChange={(event) => {
					setAddressFactory(event.target.value as `0x${string}`);
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
					const enabled: boolean = !isFetching
																&& !!ZorpFactory?.abi
																&& !!Object.keys(ZorpFactory.abi).length
																&& !!ZorpFactory?.address.length
																&& addressFactory.length === addressFactoryAnvil.length
																&& addressFactory.startsWith('0x');

					if (!enabled) {
						console.warn('Missing required input(s) ->', {
							ZorpFactory,
							addressFactory,
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

