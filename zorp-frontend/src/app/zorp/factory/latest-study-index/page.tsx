'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { useZorpContract } from '@/contexts/Contracts';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadLatestStudyIndex() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);

	const { abi: factoryAbi, isReady: isFactoryReady } = useZorpContract('IZorpFactory');

	const enabled: boolean = isFactoryReady
												&& !!factoryAbi?.length
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x');

	const { data: latest_study_index, isFetching } = useReadContract<
		typeof factoryAbi,
		'latest_study_index',
		never[],
		typeof config.wagmiConfig,
		bigint
	>({
		abi: factoryAbi,
		address: addressFactory,
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

			<ZorpFactoryAddressInput
				disabled={isFetching}
				setState={setAddressFactory}
			/>

			<span>ZorpFactory latest study index: {
				!!latest_study_index
					? latest_study_index.toString()
					: '...  waiting for client and/or contract connection'
			}</span>
		</div>
	);
}
