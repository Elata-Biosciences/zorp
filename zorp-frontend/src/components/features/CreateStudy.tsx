import { useEffect, useState } from 'react';

import {
	useAccount,
	useReadContract,
	useWalletClient,
	useWriteContract
} from 'wagmi';

import { WebUploader } from '@irys/web-upload';
import { WebBaseEth } from '@irys/web-upload-ethereum';
import { ViemV2Adapter } from '@irys/web-upload-ethereum-viem-v2';

import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

import { abi as ZorpFactoryABI } from 'abi/IZorpFactory.json';

import type { ChangeEvent } from 'react';
import type { Digest } from 'multiformats/src/hashes/digest';
import type { ResolvedRegister } from '@wagmi/core';
import type { PublicKey, Key } from 'openpgp';
import type { UploadResponse } from '@irys/upload-core';

export default function UploadIpfs({
	className,
	config,
}: {
	className?: string;
	config: {
		wagmiConfig: ResolvedRegister['config'];
		contracts: {
			ZorpFactory: {
				address: `0x${string}`;
			};
		};
	};
}) {
	const [inputGpgPublicKeyFile, setInputGpgPublicKeyFile] = useState<null | File>(null);
	const [inputGpgPublicKeyBuffer, setInputGpgPublicKeyBuffer] = useState<null | ArrayBuffer>(null);
	useEffect(() => {
		if (!inputGpgPublicKeyFile) {
			console.warn('Waiting on client for inputGpgPublicKeyFile');
			return;
		}
		inputGpgPublicKeyFile.arrayBuffer().then((buffer) => {
			setInputGpgPublicKeyBuffer(buffer);
		});
	}, [inputGpgPublicKeyFile]);

	const account = useAccount();
	const [provider, setProvider] = useState<null | unknown>(null);
	useEffect(() => {
		if (!account.isConnected) {
			console.warn('Waiting on client to connect an account');
			return;
		}
		if (!account.connector?.getProvider) {
			console.warn('Waiting on client wallet to provide a provider');
			return;
		}

		account.connector.getProvider().then((gottenProvider) => {
			setProvider(gottenProvider);
		});
	}, [account, provider]);

	const [irysBalance, setIrysBalance] = useState<null | number>(null);
	useEffect(() => {
		/**
		 * @see https://docs.irys.xyz/build/d/guides/monitor-account-balance
		 */
		if (!provider) {
			console.warn('Waiting on client wallet to provide a provider');
			return;
		}
		console.error('TODO: Find web-way of checking balance');
		setIrysBalance(0);
	}, [provider]);

	const irysBalanceThreshold = 0.1;
	const [ipfsCid, setIpfsCid] = useState<null | string>(null);
	const [irysReceipt, setIrysReceipt] = useState<null | UploadResponse>(null);
	useEffect(() => {
		/**
		 * @see https://docs.irys.xyz/build/d/guides/monitor-account-balance
		 * @see https://docs.irys.xyz/build/d/features/ipfs-cid
		 * @see https://github.com/multiformats/js-multiformats
		 */
		if (!inputGpgPublicKeyBuffer) {
			console.warn('Waiting for inputGpgPublicKeyBuffer');
			return;
		}
		if (!provider) {
			console.warn('Waiting on client wallet to provide a provider');
			return;
		}
		if (!irysBalance || Math.abs(irysBalance) <= irysBalanceThreshold) {
			console.warn('Waiting on client to fund Irys');
			return;
		}

		console.log('Attempting to SHA256 inputGpGPublicKeyBuffer');
		(sha256.digest(raw.encode(new Uint8Array(inputGpgPublicKeyBuffer))) as Promise<Digest<number, number>>)
			.then((hash) => {
				console.log('Attempting to generate an IPFS compatible CID');
				const cid = CID.create(1, raw.code, hash);

				const tags = [
					{ name: 'Content-Type', value: 'application/pgp-encrypted' },
					{ name: 'IPFS-CID', value: cid.toString() },
				];

				console.log('Attempting to upload inputGpGPublicKeyBuffer to Irys');
				WebUploader(WebBaseEth).withProvider(provider).then((irysUploadBuilder) => {
					// TODO: maybe configure `opts` AKA CreateAndUploadOptions
					// TODO: maybe investigate why nested promise chaining is required here
					return irysUploadBuilder.uploader.uploadData(
						Buffer.from(inputGpgPublicKeyBuffer),
						{ tags },
					).then((uploadResponse) => {
							console.log('Pinned encrypted data via Irys!', { uploadResponse, cid });
							setIrysReceipt(uploadResponse);
							setIpfsCid(cid.toString());
						});
				});
			});
	}, [inputGpgPublicKeyBuffer, irysBalance, provider]);

	/**
	 * @see https://wagmi.sh/react/guides/write-to-contract
	 */
	const { data: writeZorpFactoryCreateStudy, writeContract } = useWriteContract({
		config: config.wagmiConfig,
	});
	useEffect(() => {
		if (!account.isConnected) {
			console.warn('Waiting on client to connect an account');
			return;
		}
		if (!account?.address?.toString().length) {
			console.warn('Waiting on client to connect an account with an address');
			return;
		}
		if (!irysReceipt) {
			console.warn('Waiting on irysReceipt');
			return;
		}
		if (!ipfsCid) {
			console.warn('Waiting on ipfsCid');
			return;
		}

		console.log('Attempting to send submitDataIpfsCid to ZorpStudy.submitData');

		writeContract({
			abi: ZorpFactoryABI,
			address: config.contracts.ZorpFactory.address,
			functionName: 'createStudy',
			args: [
				account.address.toString(),
				ipfsCid.toString(),
			],
		});
	}, [account, irysReceipt, ipfsCid]);

	useEffect(() => {
		console.log('Transaction info ->', writeZorpFactoryCreateStudy);
	}, [writeZorpFactoryCreateStudy])

	return (
		<>
			<hr />
				<label>Your GPG/PGP public key</label>
				<input
					type="file"
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						event.stopPropagation();
						event.preventDefault();
						setInputGpgPublicKeyFile(event.target.files?.item(0) || null);
					}}
				/>
			<hr />
		</>
	);
}
