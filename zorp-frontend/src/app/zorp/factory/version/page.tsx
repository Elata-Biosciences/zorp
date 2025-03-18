'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadVersion() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [message, setMessage] = useState<string>('...  waiting for client and/or contract connection');

	const { IZorpFactory } = useContracts();

	const enabled: boolean = !!IZorpFactory?.abi
												&& !!Object.keys(IZorpFactory.abi).length
												&& !!IZorpFactory?.address.length
												&& addressFactory.length === addressFactoryAnvil.length
												&& addressFactory.startsWith('0x');

	const { data: version, isFetching } = useReadContract<
		typeof IZorpFactory.abi,
		'VERSION',
		never[],
		typeof config.wagmiConfig,
		bigint
	>({
		abi: IZorpFactory.abi,
		address: IZorpFactory.address,
		functionName: 'VERSION',
		args: [],
		query: {
			enabled,
		},
	});

	useEffect(() => {
		if (!!version) {
			if (version > 0) {
				setMessage(`ZorpFactory version: ${version}`);
			} else {
				setMessage('Error reading version from ZorpFactory');
			}
		}
	}, [ version ])

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Version
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<ZorpFactoryAddressInput
				disabled={isFetching}
				setState={setAddressFactory}
			/>

			<span>{message}</span>
		</div>
	);
}
