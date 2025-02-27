'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import ThemeSwitch from '@/components/features/ThemeSwitch';

import InputFileToGpgEncryptionKey from '@/components/features/InputFileToGpgEncryptionKey';
import IrysBalance from '@/components/features/IrysBalance';

import type { Subkey, Key } from 'openpgp';
import type { WebIrysOpts } from '@/components/features/IrysBalance';
import type { BigNumber } from 'bignumber.js';

export default function ZorpFactoryCreateStudy() {
	const { address, isConnected } = useAccount();

	useEffect(() => {
		if (isConnected) {
			// eslint-disable-next-line no-console
			console.log('Wallet address: ', address);
		} else {
			// eslint-disable-next-line no-console
			console.log('Not connected');
		}
	}, [address, isConnected]);

	const [gpgKey, setGpgKey] = useState<null | (Subkey | Key)>(null);
	const [irysBalance, setIrysBalance] = useState<null | number | BigNumber>(null);

	const irysBalanceThreshold = 0.1;
	const webIrysOpts: WebIrysOpts = {
		token: 'WAT'
	};

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Create Study
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<hr />
			<InputFileToGpgEncryptionKey setState={setGpgKey} labelText="Public GPG key" />
			<hr />
			<IrysBalance setState={setIrysBalance} labelText="Check Irys balance" webIrysOpts={webIrysOpts} address={address} />
			<hr />
		</div>
	);
}
