'use client';

import { useState } from 'react';
import { WebIrys } from '@irys/sdk';
import type { BigNumber } from 'bignumber.js';
import type { WebIrysOpts } from '@/@types/irys';

/**
 * @see https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/getIrys.ts#L107
 * @see https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/fundAndUpload.ts#L33
 */
export default function IrysBalanceGet({
	className = '',
	labelText = 'Check Irys balance',
	setState,
	webIrysOpts,
	address,
}: {
	className?: string;
	labelText: string;
	setState: (balance: null | number | BigNumber) => void;
	webIrysOpts: WebIrysOpts;
	address: string | `0x${string}` | undefined;
}) {
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');

	return (
		<>
			<label className={`irys_balance irys_balance__label ${className}`}>{labelText}</label>

			<button
				className={`irys_balance irys_balance__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();

					console.warn('IrysBalance', {event});

					if (!address) {
						const message = 'Info: waiting for client to connect wallet with an address';
						console.warn('IrysBalance', {message, address});
						setMessage(message);
						return;
					}

					try {
						new WebIrys(webIrysOpts)
							.ready()
							.then((webIrys) => {
								const message = 'Info: attempting Irys get loaded balance';
								console.warn('new WebIrys(webIrysOpts).ready()', {message, webIrys, webIrysOpts});
								setMessage(message);
								return webIrys.getBalance(address);
							}).then((balance) => {
								const message = `Success: got Irys balance of: ${balance}`;
								console.warn('new WebIrys(webIrysOpts).ready().getLoadedBalance()', {message, balance});
								setMessage(message);
								setState(balance);
							}).catch((error) => {
								let message = '';
								if ('message' in error) {
									message = error.message;
								} else {
									message = error.toString();
								}

								console.error('new WebIrys(webIrysOpts).ready() ...', {message, error});
								setMessage(message);
								setState(null);
							});
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
				}}
			>Get Irys balance</button>

			<span className={`irys_balance irys_balance__span ${className}`}>{message}</span>
		</>
	);
}
