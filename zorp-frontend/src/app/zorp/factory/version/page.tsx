'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadVersion() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);

	const addressFactoryId = useId();

	const { IZorpFactory } = useContracts();

	const enabled: boolean = !!IZorpFactory?.abi
												&& !!Object.keys(IZorpFactory.abi).length
												&& !!IZorpFactory?.address.length
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x');

	const { data: version, isFetching } = useReadContract({
		abi: IZorpFactory.abi,
		address: IZorpFactory.address,
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
