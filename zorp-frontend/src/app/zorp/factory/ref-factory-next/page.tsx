'use client';

import { useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { abi as zorpFactoryAbi } from 'abi/IZorpFactory.json';

export default function ZorpFactoryReadRefFactoryNext() {
	const addressFactoryAnvil = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const addressFactoryId = useId();

	const { data: ref_factory_next, isFetching } = useReadContract({
		address: addressFactory,
		abi: zorpFactoryAbi,
		functionName: 'ref_factory_next',
		args: [],
		query: {
			enabled: addressFactory.length === addressFactoryAnvil.length
						&& addressFactory.startsWith('0x'),
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
			<span>ZorpFactory next address: {ref_factory_next as string}</span>
		</>
	);
}
