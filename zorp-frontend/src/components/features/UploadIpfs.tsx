// TODO: investigate why TypeScript no likes '@/lib/utils/openpgpUtils'
import { openPgpEncrypt } from '../../lib/utils/openpgpUtils';

import openpgp from 'openpgp';
import { useEffect, useState } from 'react';
import { readContract, writeContract } from '@wagmi/core';
import { verifiedFetch } from '@helia/verified-fetch';

import { abi as ZorpStudyABI } from 'abi/IZorpStudy.json';

import type { ChangeEvent } from 'react';
import type { ResolvedRegister } from '@wagmi/core';
import type { PublicKey } from 'openpgp';

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
	 */
	const fileHandler = async (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target?.files?.length) {
			throw new Error('No file provided');
		}
		event.stopPropagation();
		event.preventDefault();

		const encryptionKeys: PublicKey[] = [];
		// TODO: get GPG key for client from context/session/state-storage or generate one?
		const gpgKeyClient = new openpgp.PublicKey();

		// https://1.x.wagmi.sh/core/actions/readContract
		const encryptionKey_cid = await readContract({
			address: config.contracts.ZorpStudy.address,
			abi: ZorpStudyABI,
			functionName: 'encryptionKey',
		});

		const encryptionKey = await verifiedFetch(encryptionKey_cid).then(
			(response) => {
				if (!response.ok) {
					throw new Error(`IPFS fetch failed to get -> ${encryptionKey_cid}`);
				}
				return response.text();
			}
		);

		encryptionKeys.push(encryptionKey);

		const file = event.target.files[0];
		const text = await file.text();
		const message = await openpgp.createMessage({ text });
		const cypher_text = await openpgp.encrypt({
			message,
			encryptionKeys,
			format: 'armored',
		});

		const ipfs_cid = await someApiCallToIpfs(cypher_text);

		// https://1.x.wagmi.sh/core/actions/writeContract
		// TODO: maybe notify devs of doc-rot?  Because source says two params are
		//       needed to make writeContract happy
		const result = await writeContract(config.wagmiConfig, {
			address: config.contracts.ZorpStudy.address,
			abi: ZorpStudyABI,
			functionName: 'submitData',
			args: [ipfs_cid],
		});
	};

	return (
		<>
			<label>Upload</label>

			<input className={className} type="file" onChange={fileHandler} />
		</>
	);
}
