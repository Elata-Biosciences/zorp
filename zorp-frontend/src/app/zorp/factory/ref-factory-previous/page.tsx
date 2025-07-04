'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadRefFactoryPrevious() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [message, setMessage] = useState<string | `0x${string}`>('...  waiting for client and/or contract connection');

	const { contracts } = useContracts();
	const IZorpFactory = contracts?.IZorpFactory;

	const { data: ref_factory_previous, isFetching } = useReadContract({
		abi: IZorpFactory?.abi || [],
		address: addressFactory,
		functionName: 'ref_factory_previous',
		args: [],
		query: {
			enabled: addressFactory.length === addressFactoryAnvil.length
						&& addressFactory.startsWith('0x')
						&& !!IZorpFactory?.abi
						&& !!Object.keys(IZorpFactory?.abi || {}).length
						&& !!IZorpFactory?.address.length,
		},
	});

	useEffect(() => {
		if (!!ref_factory_previous && typeof ref_factory_previous === 'string' && ref_factory_previous.startsWith('0x')) {
			if (ref_factory_previous === '0x0000000000000000000000000000000000000000') {
				setMessage('ZorpFactory is first ever of its line!');
			} else {
				setMessage(`ZorpFactory previous address: ${ref_factory_previous}`);
			}
		}
	}, [ ref_factory_previous ]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Latest study index
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<hr />

			<ZorpFactoryAddressInput
				disabled={isFetching}
				setState={setAddressFactory}
			/>

			<span>{message}</span>
		</div>
	);
}
