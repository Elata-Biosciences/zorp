'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadParticipantPayoutAmount() {
	const addressStudyAnvil = config.anvil.contracts.ZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	const addressStudyId = useId();

	const { ZorpStudy } = useContracts();

	const { data: participant_payout_amount, isFetching } = useReadContract({
		abi: ZorpStudy.abi,
		address: ZorpStudy.address,
		functionName: 'participant_payout_amount',
		args: [],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& !!ZorpStudy?.abi
						&& !!Object.keys(ZorpStudy.abi).length
						&& !!ZorpStudy?.address.length,
		},
	});

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Participant payout amount
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

			<span>ZorpStudy per-participant payout: {participant_payout_amount as string}</span>
		</div>
	);
}
