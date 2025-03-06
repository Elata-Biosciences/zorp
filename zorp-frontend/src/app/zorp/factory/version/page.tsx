'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';

export default function ZorpFactoryReadVersion() {
	const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);

	const addressFactoryId = useId();

	const { ZorpFactory } = useContracts();

	const enabled: boolean = !!ZorpFactory?.abi
												&& !!Object.keys(ZorpFactory.abi).length
												&& !!ZorpFactory?.address.length
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x');

	const { data: version, isFetching } = useReadContract({
		abi: (ZorpFactory as NonNullable<typeof ZorpFactory>).abi,
		address: (ZorpFactory as NonNullable<typeof ZorpFactory>).address,
		functionName: 'VERSION',
		args: [],
		query: {
			enabled,
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Version
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
			<span>ZorpFactory version: {version as string}</span>
		</div>
	);
}
