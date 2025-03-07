'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadRefFactoryPrevious() {
	const addressFactoryAnvil = config.anvil.contracts.ZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const addressFactoryId = useId();

	const { ZorpFactory } = useContracts();

	const { data: ref_factory_previous, isFetching } = useReadContract({
		abi: ZorpFactory.abi,
		address: ZorpFactory.address,
		functionName: 'ref_factory_previous',
		args: [],
		query: {
			enabled: addressFactory.length === addressFactoryAnvil.length
						&& addressFactory.startsWith('0x')
						&& !!ZorpFactory?.abi
						&& !!Object.keys(ZorpFactory.abi).length
						&& !!ZorpFactory?.address.length,
		},
	});

	return (
		<>
			<label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
			<input
				id={addressFactoryId}
				value={addressFactory}
				onChange={(event) => {
					setAddressFactory(event.target.value as `0x${string}`);
				}}
				disabled={isFetching}
			/>
			<span>ZorpFactory previous address: {ref_factory_previous as string}</span>
		</>
	);
}
