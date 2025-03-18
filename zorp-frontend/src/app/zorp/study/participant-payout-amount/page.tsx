'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadParticipantPayoutAmount() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [message, setMessage] = useState<string>('Waiting for client wallet connection and/or contract response');

	const { IZorpStudy } = useContracts();

	const { data: participant_payout_amount, isFetching } = useReadContract<
		typeof IZorpStudy.abi,
		'participant_payout_amount',
		never[],
		typeof config.wagmiConfig,
		bigint
	>({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		functionName: 'participant_payout_amount',
		args: [],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& !!IZorpStudy?.abi
						&& !!Object.keys(IZorpStudy.abi).length
						&& !!IZorpStudy?.address.length,
		},
	});

	useEffect(() => {
		if (!!participant_payout_amount?.toString().length) {
			setMessage(`ZorpStudy per-participant payout: ${participant_payout_amount}`);
		}
	}, [ participant_payout_amount ]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Participant payout amount
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<span>{message}</span>
		</div>
	);
}
