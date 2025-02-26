// TODO: investigate why TypeScript no likes '@/lib/utils/openpgpUtils'
import { openPgpEncrypt } from '../../lib/utils/openpgpUtils';

import openpgp from 'openpgp';
import { useEffect, useState } from 'react';
import { useReadContract, useWriteContract } from 'wagmi';
import { verifiedFetch } from '@helia/verified-fetch';

import { abi as ZorpStudyABI } from 'abi/IZorpStudy.json';

import type { ChangeEvent } from 'react';
import type { ResolvedRegister } from '@wagmi/core';
import type { PublicKey, Key } from 'openpgp';

/**
 * 0. Get data from `<input>` file upload
 * 1. Get encryption public key from `<input>` file upload
 * 2. Get encryption public key from `ZorpStudy.encryptionKey()`
 * 3. Encrypt file data with OpenPGP JS
 * 4. Upload encrypted file to IPFS (TODO)
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
		config: config.wagmiConfig,
		abi: ZorpStudyABI,
		address: config.contracts.ZorpStudy.address,
		functionName: 'encryptionKey',
	});
	useEffect(() => {
		if (!encryptionKeyCid?.length) {
			console.warn('Waiting on blockchain for encryptionKeyCid');
			return;
		}

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

	const [submitDataIpfsCid, setSubmitDataIpfsCid] = useState<null | string>(null);
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

		console.log('Handling input file ->', inputSubmitDataFile.name);

		inputSubmitDataFile.arrayBuffer().then((buffer) => {
			console.log('Converting file to OpenPGP message');
			return openpgp.createMessage({ binary: buffer });
		}).then((message: openpgp.Message<Uint8Array>) => {
			console.log('OpenPGP encrypting message/file with gpgPublicKey and encryptionKey');
			return openpgp.encrypt({
				message,
				encryptionKeys: [gpgPublicKey, encryptionKey],
				format: 'binary',
			});
		}).then((blob) => {
			throw new Error('TODO: Upload to IPFS');
			return 'ipfs_cid';
		}).then((ipfs_cid) => {
			console.log('Setting submitDataIpfsCid');
			setSubmitDataIpfsCid(ipfs_cid);
		});
	}, [inputSubmitDataFile, gpgPublicKey, encryptionKey]);

	/**
	 * @see https://wagmi.sh/react/guides/write-to-contract
	 */
	const { data: writeContractData, writeContract } = useWriteContract({
		config: config.wagmiConfig,
	});
	useEffect(() => {
		console.log('Attempting to send submitDataIpfsCid to ZorpStudy.submitData')
		writeContract({
			abi: ZorpStudyABI,
			address: config.contracts.ZorpStudy.address,
			functionName: 'submitData',
			args: [submitDataIpfsCid]
		});
	}, [submitDataIpfsCid]);
	useEffect(() => {
		console.log('Transaction info ->', writeContractData);
	}, [writeContractData])

	return (
		<>
			<hr />
			<section>
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
				<div></div>
			</section>
			<hr />
		</>
	);
}
