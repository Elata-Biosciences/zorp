'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { abi as zorpStudyAbi } from 'abi/IZorpStudy.json';

export default function ZorpStudyReadParticipantStatus() {
	const addressStudyAnvil = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [addressParticipant, setAddressParticipant] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

	const addressStudyId = useId();
	const addressParticipantId = useId();

	const { data: participant_status, isFetching } = useReadContract({
		address: addressStudy,
		abi: zorpStudyAbi,
		functionName: 'participant_status',
		args: [addressParticipant],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& addressParticipant.length === addressStudyAnvil.length
						&& addressParticipant.startsWith('0x'),
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

			<label htmlFor={addressParticipantId}>ZORP Participant Address:</label>
			<input
				id={addressParticipantId}
				value={addressParticipant}
				onChange={(event) => {
					setAddressParticipant(event.target.value as `0x${string}`);
				}}
				disabled={isFetching}
			/>

			<span>ZorpStudy participant status: {participant_status as string}</span>
		</>
	);
}
