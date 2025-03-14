'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';
import type { Subkey, Key } from 'openpgp';
import { useAccount } from 'wagmi';
import { getIrysUploaderWebBaseEth } from '@/lib/utils/irys';
import { irysBalanceThreshold } from '@/lib/constants/irysConfig';

/**
 * @see {@link https://github.com/wevm/wagmi/discussions/4297}
 * @see {@link https://wagmi.sh/react/guides/ethers}
 * @see {@link https://github.com/wevm/wagmi/discussions/2615}
 * @see {@link https://wagmi.sh/react/ethers-adapters}
 * @see {@link https://docs.irys.xyz/build/d/sdk/upload/uploadFile}
 */
export default function IrysUploadFileGpgKey({
	className = '',
	labelText = 'Irys upload public GPG encryption key',
	setState,
	gpgKey,
	irysBalance,
}: {
	className?: string;
	labelText: string;
	setState: (state: null | {
		receipt: unknown;
		cid: string;
	}) => void;
	gpgKey: null | { file: File; key: Subkey | Key; };
	irysBalance: null | (number | bigint | BigNumber);
}) {
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const { address } = useAccount();

	const handleOnClick = useCallback(async () => {
		if (!address) {
			setMessage('Info: waiting for client to connect wallet with an address');
			setState(null);
			return;
		}

		if (!gpgKey) {
			setMessage('Info: waiting for client to provide GPG key');
			setState(null);
			return;
		}

		if (!irysBalance || irysBalance <= irysBalanceThreshold) {
			setMessage('Info: waiting for client to fund Irys for upload');
			setState(null);
			return;
		}

		setMessage('Info: attempting to convert GPG key to ArrayBuffer');
		try {
			const buffer = await gpgKey.file.arrayBuffer();

			setMessage('Info: attempting SHA ArrayBuffer');
			const hash = await sha256.digest(raw.encode(new Uint8Array(buffer)));

			setMessage('Info: attempting generate an IPFS compatible CID');
			const cid = await CID.create(1, raw.code, hash);

			// TODO: check for duplicate upload via -> https://gateway.irys.xyz/ipfs/${cid}

			setMessage('Info: attempting to initalize Irys Web Uploader');
			const irysUploader = await getIrysUploaderWebBaseEth();

			setMessage('Info: attempting to upload GPG key to Irys');
			// TODO: maybe configure `opts` AKA CreateAndUploadOptions
			const receipt = await irysUploader.uploader.uploadData(
				Buffer.from(buffer),
				{
					tags: [
						{ name: 'Content-Type', value: 'application/pgp-encrypted' },
						{ name: 'IPFS-CID', value: cid.toString() },
					]
				},
			);

			setMessage(`Success: Uploded GPG key to Irys?! JSON: '{ "id": "${receipt.id}", "cid": "${cid}", "url": "https://gateway.irys.xyz/ipfs/${cid}" }'`);
			setState({ receipt, cid: cid.toString() });
			console.warn('IrysUploadFileGpgKey ->', { cid, receipt });
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

			console.error('IrysUploadFileGpgKey ...', {message, error});
			setMessage(message);
			setState(null);
		}
	}, [ address, gpgKey, irysBalance, setState ]);

	return (
		<>
			<label className={`irys_upload_file irys_upload_file__label ${className}`}>{labelText}</label>

			<button
				className={`irys_upload_file irys_upload_file__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					console.warn('IrysUploadFileGpgKey', {event});
					handleOnClick();
				}}
			>Upload GPG key to Irys</button>

			<span className={`irys_upload_file irys_upload_file__span ${className}`}>{message}</span>
		</>
	);
}
