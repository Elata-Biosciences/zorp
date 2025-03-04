'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';

export default function ZorpFactoryReadPaginateSubmittedData() {
	const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [start, setStart] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);

	const addressFactoryId = useId();
	const addressStudyId = useId();
	const startId = useId();
	const limitId = useId();

	const { data: studyAddresses, isFetching, isSuccess, refetch } = useReadContract({
		address: addressFactory,
		abi: zorpFactoryAbi,
		functionName: 'paginateStudies',
		args: [start, limit],
		query: {
			enabled: false,
		},
	});

	return (
		<>
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
					const enabled = !isFetching
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x');

					if (!enabled) {
						console.warn('Missing required input(s) ->', {
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
		</>
	);
}

