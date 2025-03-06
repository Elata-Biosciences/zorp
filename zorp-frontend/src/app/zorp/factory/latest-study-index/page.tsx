'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadLatestStudyIndex() {
	const addressFactoryAnvil = config.anvil.contracts.ZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);

	const addressFactoryId = useId();

	const { ZorpFactory } = useContracts();

	const enabled: boolean = !!ZorpFactory?.abi
												&& !!Object.keys(ZorpFactory.abi).length
												&& !!ZorpFactory?.address.length
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x');

	const { data: latest_study_index, isFetching } = useReadContract({
		abi: (ZorpFactory as NonNullable<typeof ZorpFactory>).abi,
		address: (ZorpFactory as NonNullable<typeof ZorpFactory>).address,
		functionName: 'latest_study_index',
		args: [],
		query: {
			enabled,
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Latest study index
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<hr />
			<section>
				<label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
				<input
					id={addressFactoryId}
					value={addressFactory}
					onChange={(event) => {
						setAddressFactory(event.target.value as `0x${string}`);
					}}
					disabled={isFetching}
				/>
			</section>
			<span>ZorpFactory latest study index: {latest_study_index as string}</span>
		</div>
	);
}
