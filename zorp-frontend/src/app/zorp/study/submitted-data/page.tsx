'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadSubmittedData() {
	const addressStudyAnvil = config.anvil.contracts.ZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [index, setIndex] = useState<number>(0);

	const addressStudyId = useId();
	const indexId = useId();

	const { ZorpStudy } = useContracts();

	const { data: submitted_data, isFetching } = useReadContract({
		abi: ZorpStudy.abi,
		address: ZorpStudy.address,
		functionName: 'submitted_data',
		args: [index],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& !!ZorpStudy?.abi
						&& !!Object.keys(ZorpStudy.abi).length
						&& !!ZorpStudy?.address.length
						&& !!index
						&& index > 0
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Submitted data
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

			<label htmlFor={indexId}>ZORP data index:</label>
			<input
				id={indexId}
				value={index}
				onChange={(event) => {
					const value = Number.parseInt(event.target.value);
					if (!isNaN(value)) {
						setIndex(value);
					}
				}}
				disabled={isFetching}
			/>

			<span>ZorpStudy data CID: {
				!!(submitted_data as string)?.length ? submitted_data as string : 'null'
			}</span>
		</div>
	);
}
