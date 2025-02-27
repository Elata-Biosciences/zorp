import openpgp from 'openpgp';

import { useEffect, useState } from 'react';

import {
	useAccount,
	useReadContract,
	useWalletClient,
	useWriteContract
} from 'wagmi';

import { verifiedFetch } from '@helia/verified-fetch';

import { WebUploader } from '@irys/web-upload';
import { WebBaseEth } from '@irys/web-upload-ethereum';
import { ViemV2Adapter } from '@irys/web-upload-ethereum-viem-v2';

import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 } from 'multiformats/hashes/sha2';

import { abi as ZorpStudyABI } from 'abi/IZorpStudy.json';

import type { ChangeEvent } from 'react';
import type { Digest } from 'multiformats/src/hashes/digest';
import type { ResolvedRegister } from '@wagmi/core';
import type { PublicKey, Key } from 'openpgp';
import type { UploadResponse } from '@irys/upload-core';

/**
 * 0. Get data from `<input>` file upload
 * 1. Get encryption public key from `<input>` file upload
 * 2. Get encryption public key from `ZorpStudy.encryptionKey()`
 * 3. Encrypt file data with OpenPGP JS
 * 4. Upload encrypted file to IPFS (TODO)
 *    > https://docs.irys.xyz/build/d/guides/monitor-account-balance#javascript
 *    > https://docs.irys.xyz/build/d/sdk/setup#base-ethereum
 *   - check Irys balance, and add if insufficient
 *   - 
 * 5. Write IPFS pointer to blockchain via `ZorpStudy.submitData(ipfs_cid)`
 */
export default function UploadIpfs({
	className,
	config,
}: {
	className?: string;
	config: {
		wagmiConfig: ResolvedRegister['config'];
		contracts: {
			ZorpStudy: {
				address: `0x${string}`;
			};
		};
	};
}) {
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/files
	 * @see https://github.com/microsoft/TypeScript/issues/31816
	 * @see https://1.x.wagmi.sh/core/actions/readContract
	 * @see https://1.x.wagmi.sh/core/actions/writeContract
	 * TODO: maybe notify devs of doc-rot?  Because source says two params are
	 */

	const [irysStatus, setIrysStatus] = useState<string>("Not connected");

	const [inputGpgPublicKeyFile, setInputGpgPublicKeyFile] = useState<null | File>(null);
	const [gpgPublicKey, setGpgPublicKey] = useState<null | Key>(null);
	useEffect(() => {
		/**
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader
		 * @see https://github.com/openpgpjs/openpgpjs?tab=readme-ov-file#encrypt-and-decrypt-string-data-with-pgp-keys
		 */

		if (!inputGpgPublicKeyFile) {
			console.warn('Waiting on client for inputGpgPublicKeyFile');
			return;
		} else if (!(inputGpgPublicKeyFile.type == 'application/pgp-encrypted')) {
			// WARN: the above type may not be _stable_ across all browsers
			console.error('Input file is not -> application/pgp-encrypted', { inputGpgPublicKeyFile });
			return;
		}

		console.log('Attempting to handle input file ->', inputGpgPublicKeyFile.name);

		const reader = new FileReader();

		reader.onload = () => {
			if (!reader.result?.toString().length) {
				console.warn('Problem detected while reading inputGpgPublicKeyFile');
				return;
			}
			console.log('Parsing inputGpgPublicKeyFile text with OpenPGP JS');
			openpgp.readKey({ armoredKey: reader.result.toString() }).then((key) => {
				console.log('OpenPGP JS storing inputGpgPublicKeyFile in gpgPublicKey');
				setGpgPublicKey(key);
			});
		};

		reader.onerror = () => {
			console.error('Error reading inputGpgPublicKeyFile');
		}

		reader.readAsText(inputGpgPublicKeyFile);
	}, [inputGpgPublicKeyFile]);

	const [encryptionKey, setEncryptionKey] = useState<null | Key>(null);
	// TODO: investigate using `typechain` to generate `<Contract>.d.ts` files
	//       because hard-coding the type-hints is as bad as `<thang> as <wat>`
	const { data: encryptionKeyCid } = useReadContract<
		typeof ZorpStudyABI,
		string,
		unknown[],
		typeof config.wagmiConfig,
		string
	>({
		// config: config.wagmiConfig,
		abi: ZorpStudyABI,
		address: config.contracts.ZorpStudy.address,
		functionName: 'encryptionKey',
	});
	useEffect(() => {
		if (!encryptionKeyCid?.length) {
			console.warn('Waiting on blockchain for encryptionKeyCid');
			return;
		}

		// TODO: investigate if Irys is compatible with this
		verifiedFetch(encryptionKeyCid).then((response) => {
			if (!response.ok) {
				throw new Error('Failed to fetch encryptionKeyText');
			}
			return response.text();
		}).then((text) => {
			console.log('Parsing fetched text with OpenPGP JS');
			return openpgp.readKey({ armoredKey: text });
		}).then((key) => {
			console.log('OpenPGP JS storing fetched key in encryptionKey');
			setEncryptionKey(key);
		});
	}, [encryptionKeyCid]);

	// const [encryptedSubmitData, setEncryptedSubmitData] = useState<null | string>(null);
	const [encryptedSubmitData, setEncryptedSubmitData] = useState<null | Uint8Array>(null);
	const [inputSubmitDataFile, setInputSubmitDataFile] = useState<null | File>(null);
	useEffect(() => {
		/**
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/File
		 * @see https://github.com/openpgpjs/openpgpjs?tab=readme-ov-file#encrypt-and-decrypt-uint8array-data-with-a-password
		 * @see https://github.com/openpgpjs/openpgpjs?tab=readme-ov-file#encrypt-and-decrypt-string-data-with-pgp-keys
		 */
		if (!inputSubmitDataFile) {
			console.warn('Waiting on client for inputSubmitDataFile');
			return;
		}
		if (!gpgPublicKey) {
			console.warn('Waiting on gpgPublicKey');
			return;
		}
		if (!encryptionKey) {
			console.warn('Waiting on encryptionKey');
			return;
		}

		console.log('Attempting to encrypt input file ->', inputSubmitDataFile.name);

		inputSubmitDataFile.arrayBuffer().then((buffer) => {
			console.log('Converting file to OpenPGP message');
			return openpgp.createMessage({ binary: buffer });
		}).then((message: openpgp.Message<Uint8Array>) => {
			console.log('OpenPGP encrypting message/file with gpgPublicKey and encryptionKey');
			return openpgp.encrypt({
				message,
				encryptionKeys: [gpgPublicKey, encryptionKey],
				// TODO: maybe figure out how to make irysUploader happy with
				//       Uint8Array returned by 'binary' format
				// format: 'armored',
				format: 'binary',
			});
		}).then((armoredMessage) => {
			setEncryptedSubmitData(armoredMessage);
		});
	}, [encryptedSubmitData, inputSubmitDataFile, gpgPublicKey, encryptionKey]);

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
		if (!encryptedSubmitData) {
			console.warn('Waiting for encryptedSubmitData');
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

		// TODO: this wants Uint8Array, which OpenPGP could provide, but
		//       WebUploader likes strings best according to the TypeScript
		// TODO: maybe file bug report to multiformats maintainers for the ever so
		//       inspired type of `type Await<T> = Promise<T> | T` that
		//       `sha256.digest` is hinted as
		console.log('Attempting to SHA256 encryptedSubmitData');
		(sha256.digest(raw.encode(encryptedSubmitData)) as Promise<Digest<number, number>>)
			.then((hash) => {
				console.log('Attempting to generate an IPFS compatible CID');
				const cid = CID.create(1, raw.code, hash);

				const tags = [
					{ name: 'Content-Type', value: 'application/pgp-encrypted' },
					{ name: 'IPFS-CID', value: cid.toString() },
				];

				console.log('Attempting to upload encryptedSubmitData to Irys');
				WebUploader(WebBaseEth).withProvider(provider).then((irysUploadBuilder) => {
					// TODO: maybe configure `opts` AKA CreateAndUploadOptions
					// TODO: maybe investigate why nested promise chaining is required here
					// TODO: investigate ways to satisfy `sha256.digest` and following
					//       without duplicating data as large encrypted files could make
					//       for a bad time
					return irysUploadBuilder.uploader.uploadData(
						Buffer.from(encryptedSubmitData),
						{ tags },
					).then((uploadResponse) => {
							console.log('Pinned encrypted data via Irys!', { uploadResponse, cid });
							setIrysReceipt(uploadResponse);
							setIpfsCid(cid.toString());
						});
				});
			});
	}, [encryptedSubmitData, irysBalance, provider]);

	/**
	 * @see https://wagmi.sh/react/guides/write-to-contract
	 */
	const { data: writeZorpStudySubmitDataData, writeContract } = useWriteContract({
		config: config.wagmiConfig,
	});
	useEffect(() => {
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
			abi: ZorpStudyABI,
			address: config.contracts.ZorpStudy.address,
			functionName: 'submitData',
			args: [ ipfsCid.toString() ],
		});
	}, [irysReceipt, ipfsCid]);

	useEffect(() => {
		console.log('Transaction info ->', writeZorpStudySubmitDataData);
	}, [writeZorpStudySubmitDataData])

	return (
		<>
			<hr />
			<section>
				<button onClick={async (event: React.MouseEvent<HTMLButtonElement>) => {
					/**
					 * @see https://docs.irys.xyz/build/d/guides/vite
					 * @see https://github.com/rainbow-me/rainbowkit/discussions/568
					 * @see https://github.com/wevm/wagmi/issues/3021
					 */
					if (typeof window.ethereum === 'undefined') {
						const message = 'No wallet provider found.';
						console.error(message);
						setIrysStatus(message);
						return;
					}

					const wallet = useWalletClient();
					if (!wallet.data?.account.address.length) {
						const message = 'No wallet address found.';
						console.error(message);
						setIrysStatus(message);
						return;
					}

				}}>Connect Irys</button>
				<p>{irysStatus}</p>

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
				<label>Data to encrypt and submit</label>
				<input
					type="file"
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						event.stopPropagation();
						event.preventDefault();
						setInputSubmitDataFile(event.target.files?.item(0) || null);
					}}
				/>
			</section>
			<hr />
		</>
	);
}
