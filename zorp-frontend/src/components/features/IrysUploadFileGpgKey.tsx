'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { BigNumber } from 'bignumber.js';
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';
import type { Subkey, Key } from 'openpgp';
import * as openpgp from 'openpgp';
import { useAccount } from 'wagmi';
import { getIrysUploaderWebBaseEth } from '@/lib/utils/irys';
import { irysBalanceThreshold } from '@/lib/constants/irysConfig';
import * as irysConfig from '@/lib/constants/irysConfig';

/**
 * @TODO maybe recover/setState for `receipt: undefined` when `cid` is of preexisting upload
 *
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
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');

	const { address } = useAccount();

	const { data: maybePreexistingGpgKeyFile } = useQuery({
		enabled: !!cid?.length,
		queryKey: ['cid_create-study', cid],
		queryFn: async () => {
			const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;
			setMessage(`Info: attempting to download key from ${url}`);
			console.warn(`Info: attempting to download key from ${url}`)

			const response = await fetch(url).then((response) => {
				if (!response.ok) {
					setMessage(`Warn: failed to download key from ${url}`);
					console.warn('IrysUploadFileGpgKey', { response });
				}
				return response;
			});

			const text = await response.text();

			const key = await openpgp.readKey({ armoredKey: text });
			setMessage(`Info: GPG key already uploaded at -> ${url}`);
			setState({ cid: (cid as string).toString(), receipt: undefined });
			return key;
		},
	});

	const handleOnClick = useCallback(async () => {
		if (!address) {
			setMessage('Info: waiting for client to connect wallet with an address');
			setState(null);
			return;
		}

		if (!!maybePreexistingGpgKeyFile && !!cid) {
			const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;
			setMessage(`Info: GPG key already uploaded at -> ${url}`);
			setState({ cid: cid.toString(), receipt: undefined });
			return;
		};

		if (!gpgKey) {
			setMessage('Info: waiting for client to provide GPG key');
			setState(null);
			return;
		}

		const buffer = await gpgKey.file.arrayBuffer();
		const hash = await sha256.digest(raw.encode(new Uint8Array(buffer)));
		setCid((await CID.create(1, raw.code, hash)).toString());

		if (!irysBalance || irysBalance <= irysBalanceThreshold) {
			setMessage('Info: waiting for client to fund Irys for upload');
			setState(null);
			return;
		}

		if (!cid) {
			setMessage('Error: cannot cope with no CID');
			setState(null);
			return;
		}

		setMessage('Info: attempting to convert GPG key to ArrayBuffer');
		try {
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
	}, [
		address,
		cid,
		gpgKey,
		irysBalance,
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
					console.warn('IrysUploadFileGpgKey', {event});
					handleOnClick();
				}}
			>Upload GPG key to Irys</button>

			<span className={`irys_upload_file irys_upload_file__span ${className}`}>{message}</span>
		</>
	);
}
