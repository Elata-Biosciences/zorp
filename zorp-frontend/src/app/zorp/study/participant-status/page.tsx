'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadParticipantStatus() {
	const addressStudyAnvil = config.anvil.contracts.ZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [addressParticipant, setAddressParticipant] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

	const addressStudyId = useId();
	const addressParticipantId = useId();

	const { ZorpStudy } = useContracts();

	const { data: participant_status, isFetching } = useReadContract({
		abi: ZorpStudy.abi,
		address: ZorpStudy.address,
		functionName: 'participant_status',
		args: [addressParticipant],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& addressParticipant.length === addressStudyAnvil.length
						&& addressParticipant.startsWith('0x')
						&& !!ZorpStudy?.abi
						&& !!Object.keys(ZorpStudy.abi).length
						&& !!ZorpStudy?.address.length,
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Participant status
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
		</div>
	);
}
