'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';

export default function ZorpStudyReadCreator() {
	const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	const addressStudyId = useId();

	const { data: creator, isFetching } = useReadContract({
		address: addressStudy,
		abi: zorpStudyAbi,
		functionName: 'creator',
		args: [],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x'),
		},
	});

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

			<span>ZorpStudy creator address: {creator as `0x${string}`}</span>
		</>
	);
}
