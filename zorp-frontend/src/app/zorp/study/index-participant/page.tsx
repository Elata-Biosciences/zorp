'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadParticipantAddress() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [indexParticipant, setIndexParticipant] = useState<null | bigint>(null);
	const [message, setMessage] = useState<string>('Waiting for client connection or contract response');

	const indexParticipantId = useId();

	const { contracts } = useContracts();
	const IZorpStudy = contracts?.IZorpStudy;

	const { data: participant_address, isFetching } = useReadContract({
		abi: IZorpStudy?.abi || [],
		address: addressStudy,
		functionName: 'participant_address',
		args: [indexParticipant],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& Number.isNaN(indexParticipant)
						&& !!IZorpStudy?.abi
						&& !!Object.keys(IZorpStudy?.abi || []).length
						&& !!addressStudy.length,
		},
	});

	useEffect(() => {
		if (!!participant_address?.toString().length) {
			if (participant_address == BigInt(0) || participant_address == 0) {
				setMessage('ZorpStudy participation not detected');
			} else {
				setMessage(`ZorpStudy participant address: ${participant_address}`);
			}
		}
	}, [ participant_address ]);

	const handleChangeParticipantIndex = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		if (!(new RegExp('^[0-9]+$')).test(event.target.value)) {
			setIndexParticipant(null);
			return;
		}

		const value = BigInt(event.target.value);
		if (Number.isNaN(value)) {
			setIndexParticipant(null);
			return;
		}

		setIndexParticipant(value);
	}, [ setIndexParticipant ]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Index participant
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<label htmlFor={indexParticipantId}>ZORP Participant Index:</label>
			<input
				id={indexParticipantId}
				value={
					indexParticipant == null
						? 'NaN'
						: indexParticipant.toString()
				}
				onChange={handleChangeParticipantIndex}
				disabled={isFetching}
			/>

			<span>{message}</span>
		</div>
	);
}
