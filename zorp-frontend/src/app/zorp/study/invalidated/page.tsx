'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadInvalidated() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [message, setMessage] = useState<string>('Waiting for client wallet connection and/or contract response');

	const { IZorpStudy } = useContracts();

	const { data: invalidated, isFetching } = useReadContract<
		typeof IZorpStudy.abi,
		'invalidated',
		never[],
		typeof config.wagmiConfig,
		bigint
	>({
		abi: IZorpStudy.abi,
		address: addressStudy,
		functionName: 'invalidated',
		args: [],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& !!IZorpStudy?.abi
						&& !!Object.keys(IZorpStudy.abi).length
						&& !!addressStudy.length,
		},
	});

	useEffect(() => {
		if (!!invalidated?.toString().length) {
			setMessage(`ZorpStudy invalidated count: ${invalidated}`);
		}
	}, [ invalidated ]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Invalidated count
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
