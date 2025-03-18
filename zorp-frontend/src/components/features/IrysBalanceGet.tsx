'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import { useAccount } from 'wagmi';
import { useIrysWebUploaderBuilderBaseEth } from '@/hooks/useIrys';

/**
 * @see {@link https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/fundAndUpload.ts#L33}
 * @see {@link https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/getIrys.ts#L107}
 * @see {@link https://github.com/wevm/wagmi/discussions/2405}
 * @see {@link https://docs.irys.xyz/build/d/sdk/setup#base-ethereum}
 * @see {@link https://docs.irys.xyz/build/programmability/connecting-to-testnet}
 */
export default function IrysBalanceGet({
	className = '',
	labelText = 'Check Irys balance',
	setState,
}: {
	className?: string;
	labelText: string;
	setState: (balance: null | number | BigNumber | bigint) => void;
}) {
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const { address } = useAccount();
	const irysWebUploaderBuilderBaseEth = useIrysWebUploaderBuilderBaseEth();

	const handleIrysBalanceGet = useCallback(async () => {
		if (!address) {
			setMessage('Info: waiting for client to connect wallet with an address');
			setState(null);
			return;
		}

		if (!irysWebUploaderBuilderBaseEth) {
			setMessage('Info: waiting for Irys Web Uploader Builder to connect');
			setState(null);
			return;
		}

		try {
			const irysUploaderWebBaseEth = await irysWebUploaderBuilderBaseEth.build();
			const balance = await irysUploaderWebBaseEth.getBalance(address);
			setMessage(`Irys balance: ${balance}`);
			setState(balance);
			return balance;
		} catch (error) {
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

			setMessage(message);
			console.error('IrysBalanceGet ->', { error, message });
			return error;
		}
	}, [ address, irysWebUploaderBuilderBaseEth, setState ]);

	return (
		<>
			<label className={`irys_balance irys_balance__label ${className}`}>{labelText}</label>

			<button
				className={`irys_balance irys_balance__button ${className}`}
				onClick={async (event) => {
					event.stopPropagation();
					event.preventDefault();
					await handleIrysBalanceGet();
				}}
			>Get Irys balance</button>

			<span className={`irys_balance irys_balance__span ${className}`}>{message}</span>
		</>
	);
}
