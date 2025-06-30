'use client';

import { useCallback, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadSubmittedData() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [index, setIndex] = useState<number>(0);

	const indexId = useId();

	const { contracts } = useContracts();
	const IZorpStudy = contracts?.IZorpStudy;

	const { data: submitted_data, isFetching } = useReadContract({
		abi: IZorpStudy?.abi || [],
		address: addressStudy,
		functionName: 'submitted_data',
		args: [index],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& !!IZorpStudy?.abi
						&& !!Object.keys(IZorpStudy?.abi || []).length
						&& !!addressStudy.length
						&& !!index
						&& index > 0
		},
	});

	const handleChangeDataIndex = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(event.target.value);
		if (!isNaN(value)) {
			setIndex(value);
		}
	}, [ setIndex ]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Submitted data
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<label htmlFor={indexId}>ZORP data index:</label>
			<input
				id={indexId}
				value={index}
				onChange={handleChangeDataIndex}
				disabled={isFetching}
			/>

			<span>ZorpStudy data CID: {
				!!(submitted_data as string)?.length ? submitted_data as string : 'null'
			}</span>
		</div>
	);
}
