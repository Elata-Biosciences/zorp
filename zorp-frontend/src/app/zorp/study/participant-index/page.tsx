'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadParticipantIndex() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [addressParticipant, setAddressParticipant] = useState<`0x${string}`>('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
	const [message, setMessage] = useState<string>('Waiting for client connection or contract response');

	const addressParticipantId = useId();

	const { IZorpStudy } = useContracts();

	const { data: participant_index, isFetching } = useReadContract<
		typeof IZorpStudy.abi,
		'participant_index',
		[`0x${string}`],
		typeof config.wagmiConfig,
		bigint | number
	>({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		functionName: 'participant_index',
		args: [addressParticipant],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& addressParticipant.length === addressStudyAnvil.length
						&& addressParticipant.startsWith('0x')
						&& !!IZorpStudy?.abi
						&& !!Object.keys(IZorpStudy.abi).length
						&& !!IZorpStudy?.address.length,
		},
	});

	useEffect(() => {
		if (!!participant_index?.toString().length) {
			if (participant_index == BigInt(0) || participant_index == 0) {
				setMessage('ZorpStudy participation not detected');
			} else {
				setMessage(`ZorpStudy participant index: ${participant_index}`);
			}
		}
	}, [ participant_index ]);

	const handleChangeParticipantAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressParticipant(event.target.value as `0x${string}`);
	}, [ setAddressParticipant ]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Participant index
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
