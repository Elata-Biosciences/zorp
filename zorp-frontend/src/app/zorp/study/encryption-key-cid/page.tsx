'use client';

import { useCallback, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadEncryptionKeyCid() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	const { IZorpStudy } = useContracts();

	const enabled = addressStudy.length === addressStudyAnvil.length
								&& addressStudy.startsWith('0x')
								&& !!IZorpStudy?.abi
								&& !!Object.keys(IZorpStudy.abi).length
								&& !!IZorpStudy?.address.length;

	const { data: encryption_key_cid, isFetching, refetch } = useReadContract({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		functionName: 'encryption_key',
		args: [],
		query: {
			enabled: false,
		},
	});

	const handleOnClick = useCallback(async () => {
		if (!enabled) {
			return;
		}

		await refetch();
	}, [
		enabled,
		refetch,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Encryption key CID
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpStudyAddressInput
				disabled={isFetching}
				setState={setAddressStudy}
			/>

			<button
				onClick={async (event) => {
					event.stopPropagation();
					event.preventDefault();
					await handleOnClick()
				}}
			>Request GPG key CID</button>

			<span>ZorpStudy encryption key CID: {encryption_key_cid as string}</span>
		</div>
	);
}
