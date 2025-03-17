'use client';

import { useCallback, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryReadRefFactoryNext() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const addressFactoryId = useId();

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

	const handleChangeFactoryAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressFactory(event.target.value as `0x${string}`);
	}, [ setAddressFactory ]);

	return (
		<>
			<label htmlFor={addressFactoryId}>ZORP Factory Address:</label>
			<input
				id={addressFactoryId}
				value={addressFactory}
				onChange={handleChangeFactoryAddress}
				disabled={isFetching}
			/>
			<span>ZorpFactory next address: {ref_factory_next as string}</span>
		</>
	);
}
