'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadParticipantStatus() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [addressParticipant, setAddressParticipant] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
	const [message, setMessage] = useState<string>('Waiting for client wallet connection and/or contract response');

	const addressParticipantId = useId();

	const { contracts } = useContracts();
	const IZorpStudy = contracts?.IZorpStudy;

	const { data: participant_status, isFetching } = useReadContract({
		abi: IZorpStudy?.abi || [],
		address: addressStudy,
		functionName: 'participant_status',
		args: [addressParticipant],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& addressParticipant.length === addressStudyAnvil.length
						&& addressParticipant.startsWith('0x')
						&& !!IZorpStudy?.abi
						&& !!Object.keys(IZorpStudy?.abi || []).length
						&& !!addressStudy.length,
		},
	});

	useEffect(() => {
		if (!!participant_status?.toString().length) {
			let messageText = 'ZorpStudy participant status: ';
			if (participant_status == 0) {
				messageText += 'NA';
			} else if (participant_status == 1) {
				messageText += 'Submitted';
			} else if (participant_status == 2) {
				messageText += 'Paid';
			} else if (participant_status == 3) {
				messageText += 'Invalid';
			} else {
				messageText += 'Error unrecognized state';
			}
			setMessage(messageText)
		}
	}, [ participant_status ])

	const handleChangeParticipantAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressParticipant(event.target.value as `0x${string}`);
	}, [ setAddressParticipant ]);


	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Participant status
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<label htmlFor={addressParticipantId}>ZORP Participant Address:</label>
			<input
				id={addressParticipantId}
				value={addressParticipant}
				onChange={handleChangeParticipantAddress}
				disabled={isFetching}
			/>

			<span>{message}</span>
		</div>
	);
}
