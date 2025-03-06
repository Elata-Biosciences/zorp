'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as openpgp from 'openpgp';
import type { Key } from 'openpgp';
import { useReadContract } from 'wagmi';
import { abi as ZorpStudyABI } from 'abi/IZorpStudy.json';
import { useContracts } from '@/contexts/Contracts';
import * as irysConfig from '@/lib/constants/irysConfig';
import * as wagmiConfig from '@/lib/constants/wagmiConfig';

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
		functionName: 'encryption_key',
	});

	useQuery({
		enabled: !!cid?.length,
		queryKey: ['cid', cid],
		queryFn: async () => {
			const url = `${irysConfig.gatewayUrl.irys}/${cid}`;
			setMessageFetchEncryptionKey(`Info: attempting to download key from ${url}`);

			const response = await fetch(url).then((response) => {
				if (!response.ok) {
					setMessageFetchEncryptionKey(`Error: failed to download key from ${url}`);
					console.error('IrysUploadFileGpgKey', {response});
					throw new Error(`Response not okay, status code: ${response.status}`);
				}
				return response;
			});

			const text = await response.text();

			const key = await openpgp.readKey({ armoredKey: text });
			setMessageFetchEncryptionKey('Success: fetched and recovered encryption key for study!');
			setState({ response, key });
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
			<p className={`irys_fetch_gpg_key irys_fetch_gpg_key__read_contract ${className}`}>{messageReadContract}</p>
			<p className={`irys_fetch_gpg_key irys_fetch_gpg_key__fetch_status ${className}`}>{messageFetchEncryptionKey}</p>
		</>
	);
}
