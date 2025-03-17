'use client';

import { useCallback, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadStudyAddress() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [studyIndex, setStudyIndex] = useState<number>(1);

	const addressFactoryId = useId();
	const addressFactoryStudyIndexId = useId();

	const { IZorpFactory } = useContracts();

	const enabled: boolean = !!IZorpFactory?.abi
												&& !!Object.keys(IZorpFactory.abi).length
												&& !!IZorpFactory?.address.length
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x')
												&& !Number.isNaN(studyIndex)
												&& studyIndex > 0

	const { data: studyAddress, isFetching } = useReadContract({
		abi: IZorpFactory.abi,
		address: IZorpFactory.address,
		functionName: 'studies',
		args: [studyIndex],
		query: {
			enabled,
		},
	});

	const handleChangeFactoryAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressFactory(event.target.value as `0x${string}`);
	}, [ setAddressFactory ]);

	const handleChangeStudyIndex = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(event.target.value);
		if (!isNaN(value)) {
			setStudyIndex(value);
		}
	}, [ setStudyIndex ]);

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
				onChange={handleChangeFactoryAddress}
				disabled={isFetching}
			/>

			<label htmlFor={addressFactoryStudyIndexId}>ZORP Study index:</label>
			<input
				id={addressFactoryStudyIndexId}
				value={studyIndex}
				onChange={handleChangeStudyIndex}
				disabled={isFetching}
			/>

			<span>ZorpFactory study address: {studyAddress as `0x${string}`}</span>
		</div>
	);
}
