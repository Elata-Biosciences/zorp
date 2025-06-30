'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadCreator() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	const { contracts } = useContracts();
	const IZorpStudy = contracts?.IZorpStudy;

	const { data: creator, isFetching } = useReadContract({
		abi: IZorpStudy?.abi || [],
		address: addressStudy,
		functionName: 'creator',
		args: [],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& !!IZorpStudy?.abi
						&& !!Object.keys(IZorpStudy?.abi || {}).length
						&& !!addressStudy.length,
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Creator
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<span>ZorpStudy creator address: {typeof creator === 'string' ? creator : 'Loading...'}</span>
		</div>
	);
}
