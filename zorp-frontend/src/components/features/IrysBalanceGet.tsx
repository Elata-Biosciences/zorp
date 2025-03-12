'use client';

import { useCallback, useState } from 'react';
import { WebIrys } from '@irys/sdk';
import type { BigNumber } from 'bignumber.js';
import { useAccount } from 'wagmi';
import { webIrysOpts } from '@/lib/constants/irysConfig';

/**
 * @see https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/getIrys.ts#L107
 * @see https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/fundAndUpload.ts#L33
 */
export default function IrysBalanceGet({
	className = '',
	labelText = 'Check Irys balance',
	setState,
}: {
	className?: string;
	labelText: string;
	setState: (balance: null | number | BigNumber) => void;
}) {
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const { address } = useAccount();

	const handleIrysBalanceGet = useCallback(async () => {
		if (!address) {
			const message = 'Info: waiting for client to connect wallet with an address';
			setMessage(message);
			return;
		}

		try {
			const webIrys = await (new WebIrys(webIrysOpts)).ready();
			const balance = await webIrys.getBalance(address);
			const message = `Irys balance: ${balance}`;
			setMessage(message);
			setState(balance);
		} catch (error: unknown) {
			let message = 'Error: ';
			if (!!error && typeof error == 'object') {
				if ('message' in error) {
					message += error.message;
				} else if ('toString' in error) {
					message += error.toString();
				} else {
					message += `Novel error detected -> ${error}`;
				}
			} else {
				message += `Novel error detected -> ${error}`;
			}

			console.error('new WebIrys(webIrysOpts).ready() ...', {message, error});
			setMessage(message);
			setState(null);
		}
	}, [ address, setState ]);

	return (
		<>
			<label className={`irys_balance irys_balance__label ${className}`}>{labelText}</label>

			<button
				className={`irys_balance irys_balance__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					handleIrysBalanceGet(event);
				}}
			>Get Irys balance</button>

			<span className={`irys_balance irys_balance__span ${className}`}>{message}</span>
		</>
	);
}
