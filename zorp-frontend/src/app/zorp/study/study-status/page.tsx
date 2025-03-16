'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadStudyStatus() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	const addressStudyId = useId();

	const { IZorpStudy } = useContracts();

	const { data: study_status, isFetching } = useReadContract({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
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

			<label htmlFor={addressStudyId}>ZORP Study Address:</label>
			<input
				id={addressStudyId}
				value={addressStudy}
				onChange={(event) => {
					setAddressStudy(event.target.value as `0x${string}`);
				}}
				disabled={isFetching}
			/>

			<span>ZorpStudy status: {study_status as string}</span>
		</div>
	);
}
