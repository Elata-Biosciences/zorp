'use client';

import { WebIrys } from '@irys/sdk';
import { useEffect, useState } from 'react';

import type { ChangeEvent } from 'react';
import type { Network, IrysConfig } from '@irys/sdk/build/cjs/common/types.d.ts';
import type { BigNumber } from 'bignumber.js';

/**
 * @see @irys/sdk/build/cjs/common/types.d.ts
 * @see https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/getIrys.ts#L107
 * @see https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/fundAndUpload.ts#L33
 */
export type WebIrysOpts = {
	url?: string;
	network?: Network;
	token: string;
	wallet?: {
			rpcUrl?: string;
			name?: string;
			provider: object;
			[key: string]: any;
	};
	config?: IrysConfig;
}

export default function IrysBalance({
	className = '',
	labelText = 'Check Irys balance',
	setState,
	webIrysOpts,
}: {
	className?: string;
	labelText: string;
	setState: (balance: null | number | BigNumber) => void;
	webIrysOpts: WebIrysOpts;
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

					console.log('IrysBalance', {event});

					try {
						new WebIrys(webIrysOpts)
							.ready()
							.then((webIrys) => {
								const message = 'Info: attempting Irys get loaded balance';
								console.log('new WebIrys(webIrysOpts).ready()', {message, webIrys, webIrysOpts});
								setMessage(message);
								return webIrys.getLoadedBalance();
							}).then((balance) => {
								const message = `Success: got Irys balance of: ${balance}`;
								console.log('new WebIrys(webIrysOpts).ready().getLoadedBalance()', {message, balance});
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
					} catch (error: any) {
						let message = 'Error: ';
						if ('message' in error) {
							message += error.message;
						} else {
							message += error.toString();
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
