'use client';

import { useCallback, useId, useState } from 'react';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryAddressInput({
	disabled,
	setState,
	labelText = 'ZORP Factory Address:',
}: {
	disabled: boolean;
	setState: (address: `0x${string}`) => void;
	labelText?: string;
}) {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	const addressFactoryId = useId();

	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);

	const handleChangeFactoryAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value as `0x${string}`;
		setState(value);
		setAddressFactory(value);
	}, [ setState ]);

	return (
		<>
			<label htmlFor={addressFactoryId}>{labelText}</label>
			<input
				id={addressFactoryId}
				value={addressFactory}
				onChange={handleChangeFactoryAddress}
				disabled={disabled}
			/>
		</>
	)
}
