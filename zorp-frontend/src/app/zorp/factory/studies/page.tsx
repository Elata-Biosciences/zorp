'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';

export default function ZorpFactoryReadStudyAddress() {
	const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [studyIndex, setStudyIndex] = useState<number>(1);
	const addressFactoryId = useId();
	const addressFactoryStudyIndexId = useId();

	const { data: studyAddress, isFetching, isSuccess } = useReadContract({
		address: addressFactory,
		abi: zorpFactoryAbi,
		functionName: 'studies',
		args: [studyIndex],
		query: {
			enabled: addressFactory.length === addressFactoryAnvil.length
						&& addressFactory.startsWith('0x')
						&& !Number.isNaN(studyIndex)
						&& studyIndex > 0,
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
				disabled={isFetching}
			/>

			<label htmlFor={addressFactoryStudyIndexId}>ZORP Study index:</label>
			<input
				id={addressFactoryStudyIndexId}
				value={studyIndex}
				onChange={(event) => {
					const value = Number.parseInt(event.target.value);
					if (Number.isNaN(value) || value < 1) {
						console.error('Input value was not an intager greater than 1');
						return;
					}
					setStudyIndex(value);
				}}
				disabled={isFetching}
			/>

			<span>ZorpFactory study address: {studyAddress as `0x${string}`}</span>
		</>
	);
}
