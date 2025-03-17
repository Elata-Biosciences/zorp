'use client';

import { useCallback, useId, useState } from 'react';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyAddressInput({
	disabled,
	setState,
	labelText = 'ZORP Study Address:',
}: {
	disabled: boolean;
	setState: (address: `0x${string}`) => void;
	labelText?: string;
}) {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const addressStudyId = useId();

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	const handleChangeStudyAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value as `0x${string}`;
		setState(value);
		setAddressStudy(value);
	}, [ setState ]);

	return (
		<>
			<label htmlFor={addressStudyId}>{labelText}</label>
			<input
				id={addressStudyId}
				value={addressStudy}
				onChange={handleChangeStudyAddress}
				disabled={disabled}
			/>
		</>
	)
}
