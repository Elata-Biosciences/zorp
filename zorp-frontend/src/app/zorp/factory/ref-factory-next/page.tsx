'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadRefFactoryNext() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);

	const { IZorpFactory } = useContracts();

	const { data: ref_factory_next, isFetching } = useReadContract({
		abi: IZorpFactory.abi,
		address: IZorpFactory.address,
		functionName: 'ref_factory_next',
		args: [],
		query: {
			enabled: addressFactory.length === addressFactoryAnvil.length
						&& addressFactory.startsWith('0x')
						&& !!IZorpFactory?.abi
						&& !!Object.keys(IZorpFactory.abi).length
						&& !!IZorpFactory?.address.length,
		},
	});

	return (
		<>

			<ZorpFactoryAddressInput
				disabled={isFetching}
				setState={setAddressFactory}
			/>

			<span>ZorpFactory next address: {ref_factory_next as string}</span>
		</>
	);
}
