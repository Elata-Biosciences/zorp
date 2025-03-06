'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';

export default function ZorpFactoryReadStudyAddress() {
	const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [studyIndex, setStudyIndex] = useState<number>(1);

	const addressFactoryId = useId();
	const addressFactoryStudyIndexId = useId();

	const { ZorpFactory } = useContracts();

	const enabled: boolean = !!ZorpFactory?.abi
												&& !!Object.keys(ZorpFactory.abi).length
												&& !!ZorpFactory?.address.length
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x')
												&& !Number.isNaN(studyIndex)
												&& studyIndex > 0

	const { data: studyAddress, isFetching } = useReadContract({
		abi: (ZorpFactory as NonNullable<typeof ZorpFactory>).abi,
		address: (ZorpFactory as NonNullable<typeof ZorpFactory>).address,
		functionName: 'studies',
		args: [studyIndex],
		query: {
			enabled,
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Studies
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
		</div>
	);
}
