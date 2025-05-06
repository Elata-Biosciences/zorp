'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadStudyStatus() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	const { IZorpStudy } = useContracts();

	const { data: study_status, isFetching } = useReadContract<
		typeof IZorpStudy.abi,
		'study_status',
		[`0x${string}`],
		typeof config.wagmiConfig,
		bigint | 0 | 1 | 2
	>({
		abi: IZorpStudy.abi,
		address: addressStudy,
		functionName: 'study_status',
		args: [],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x'),
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Start
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<span>ZorpStudy status: {study_status?.toString()}</span>
		</div>
	);
}
