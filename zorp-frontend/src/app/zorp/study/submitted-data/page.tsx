'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';

export default function ZorpStudyReadSubmittedData() {
	const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [index, setIndex] = useState<number>(0);

	const addressStudyId = useId();
	const indexId = useId();

	const { data: submitted_data, isFetching } = useReadContract({
		address: addressStudy,
		abi: zorpStudyAbi,
		functionName: 'submitted_data',
		args: [index],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& !!index
						&& index > 0
		},
	});
	console.warn({ submitted_data });

	return (
		<>
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
				!!(submitted_data as string).length ? submitted_data as string : 'null'
			}</span>
		</>
	);
}
