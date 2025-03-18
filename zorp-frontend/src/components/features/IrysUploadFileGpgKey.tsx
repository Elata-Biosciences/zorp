'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import type { Subkey, Key } from 'openpgp';
import { useAccount } from 'wagmi';
import { cidFromFile } from '@/lib/utils/ipfs';
import { getGpgKeyFromCid } from '@/lib/utils/irys';
import { useIrysWebUploaderBuilderBaseEth } from '@/hooks/useIrys';
import * as irysConfig from '@/lib/constants/irysConfig';

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
	const [cid, setCid] = useState<null | string>(null);
	const [maybePreexistingGpgKeyFile, setMaybePreexistingGpgKeyFile] = useState<null | (Key | Subkey)>(null);
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const irysWebUploaderBuilderBaseEth = useIrysWebUploaderBuilderBaseEth();

	const { address } = useAccount();

	const handleOnClick = useCallback(async () => {
		if (!address) {
			setMessage('Info: waiting for client to connect wallet with an address');
			setState(null);
			return;
		}

		if (!!maybePreexistingGpgKeyFile && !!cid) {
			const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;
			setMessage(`Info: GPG key already uploaded at -> ${url}`);
			setState({ cid, receipt: undefined });
			return;
		};

		if (!gpgKey) {
			setMessage('Info: waiting for client to provide GPG key');
			setState(null);
			return;
		}

		if (gpgKey.file.size >= irysConfig.irysThreshold.fileSizeMaxFree) {
			if (!irysBalance || irysBalance <= irysConfig.irysThreshold.minimumBalance) {
				setMessage('Info: waiting for client to fund Irys for upload');
				setState(null);
				return;
			}
		}

		if (!irysWebUploaderBuilderBaseEth) {
			setMessage('Info: waiting for Irys Web Uploader Builder to connect');
			setState(null);
			return;
		}

		try {
			setMessage('Info: attempting to generate CID from GPG key file');
			const cid = await cidFromFile(gpgKey.file);
			setCid(cid);

			const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;
			setMessage(`Info: attempting to download key from ${url}`);

			const { key } = await getGpgKeyFromCid(cid);
			if (!!key) {
				setMessage(`Info: GPG key already uploaded at -> ${url}`);
				setState({ cid, receipt: undefined });
				setMaybePreexistingGpgKeyFile(key);
				return key;
			}

			setMessage('Info: attempting to initalize Irys Web Uploader');
			const irysUploaderWebBaseEth = await irysWebUploaderBuilderBaseEth.build();

			setMessage('Info: attempting to upload GPG key to Irys');
			const buffer = await gpgKey.file.arrayBuffer();
			// TODO: maybe configure `opts` AKA CreateAndUploadOptions
			const receipt = await irysUploaderWebBaseEth.uploader.uploadData(
				Buffer.from(buffer),
				{
					tags: [
						{ name: 'Content-Type', value: 'application/pgp-encrypted' },
						{ name: 'IPFS-CID', value: cid },
					]
				},
			);

			setMessage(`Success: Uploded GPG key to Irys?! JSON: '{ "id": "${receipt.id}", "cid": "${cid}", "url": "${url}" }'`);
			const state = { receipt, cid };
			setState(state);
			return state;
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

			console.error('IrysUploadFileGpgKey ->', { message, error });
			setMessage(message);
			setState(null);
			return error;
		}
	}, [
		address,
		cid,
		gpgKey,
		irysBalance,
		irysWebUploaderBuilderBaseEth,
		maybePreexistingGpgKeyFile,
		setState,
	]);

	return (
		<>
			<label className={`irys_upload_file irys_upload_file__label ${className}`}>{labelText}</label>

			<button
				className={`irys_upload_file irys_upload_file__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					handleOnClick();
				}}
			>Upload GPG key to Irys</button>

			<span className={`irys_upload_file irys_upload_file__span ${className}`}>{message}</span>
		</>
	);
}
