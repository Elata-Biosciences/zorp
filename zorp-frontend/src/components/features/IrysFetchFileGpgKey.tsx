'use client';

import * as openpgp from 'openpgp';

import { useQuery } from '@tanstack/react-query';

import { useEffect, useState } from 'react';

import { useReadContract } from 'wagmi';

import * as wagmiConfig from '@/lib/constants/wagmiConfig';
import * as irysConfig from '@/lib/constants/irysConfig';

import { abi as ZorpStudyABI } from 'abi/IZorpStudy.json';

import type { Key } from 'openpgp';

export default function IrysFetchFileGpgKey({
	className = '',
	setState,
}: {
	className?: string;
	setState: (study_encryption_key: null | { response: Response; key: Key; }) => void;
}) {
	const [messageReadContract, setMessageReadContract] = useState<string>('Info: Waiting for ZorpStudy.encryptionKey() read to return something...');
	const [messageFetchEncryptionKey, setMessageFetchEncryptionKey] = useState<string>('Info: waiting for fetch of CID ZorpStudy.encryptionKey() to return something...');

	// TODO: set `chainName` and `sourceId` dynamically or via `.env.<thang>` file
	const chainName = 'anvil';
	const sourceId = 31337
	const { data: cid } = useReadContract<
		typeof ZorpStudyABI,
		string,
		unknown[],
		typeof wagmiConfig.wagmiConfig,
		string
	>({
		config: wagmiConfig.wagmiConfig,
		abi: ZorpStudyABI,
		address: wagmiConfig[chainName].contracts.ZorpStudy[sourceId].address,
		functionName: 'encryptionKey',
	});

	const { data: encryptionKey } = useQuery({
		enabled: !!cid?.length,
		queryKey: ['cid', cid],
		queryFn: () => {
			const url = `${irysConfig.gatewayUrl.irys}/${cid}`;
			setMessageFetchEncryptionKey(`Info: attempting to download key from ${url}`);
			return fetch(url).then((response) => {
				if (!response.ok) {
					setMessageFetchEncryptionKey(`Error: failed to download key from ${url}`);
					console.error('IrysUploadFileGpgKey', {response});
					throw new Error(`Response not okay, status code: ${response.status}`);
				}
				return response.text()
					.then((text) => {
						setMessageFetchEncryptionKey('Info: attempting to convert fetched data to OpenPGP key');
						return openpgp.readKey({ armoredKey: text });
					})
					.then((key) => {
						setMessageFetchEncryptionKey('Success: fetched and recovered encryption key for study!');
						setState({ response, key });
					});
			});
		},
	});

	useEffect(() => {
		if (!cid) {
			return;
		}
		const message = `Success: ZorpStudy.encryptionKey() read returned: ${cid}`;
		setMessageReadContract(message);
	}, [cid])

	return (
		<>
			<p>{messageReadContract}</p>
			<p>{messageFetchEncryptionKey}</p>
		</>
	);
}
