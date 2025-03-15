'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Key } from 'openpgp';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import { getGpgKeyFromCid } from '@/lib/utils/irys';
import * as wagmiConfig from '@/lib/constants/wagmiConfig';

export default function IrysFetchFileGpgKey({
	className = '',
	setState,
}: {
	className?: string;
	setState: (study_encryption_key: null | { key: Key; response: Response; }) => void;
}) {
	const [messageReadContract, setMessageReadContract] = useState<string>('Info: Waiting for ZorpStudy.encryptionKey() read to return something...');
	const [messageFetchEncryptionKey, setMessageFetchEncryptionKey] = useState<string>('Info: waiting for fetch of CID ZorpStudy.encryptionKey() to return something...');

	const { IZorpStudy } = useContracts();

	const { data: cid } = useReadContract<
		typeof IZorpStudy.abi,
		string,
		unknown[],
		typeof wagmiConfig.wagmiConfig,
		string
	>({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		config: wagmiConfig.wagmiConfig,
		functionName: 'encryption_key',
	});

	useQuery({
		enabled: !!cid?.length,
		queryKey: ['cid', cid],
		queryFn: async () => {
			if (!cid) {
				setMessageFetchEncryptionKey('Waiting for CID to be returned by ZorpStudy');
				setState(null);
				return;
			}

			const result = await getGpgKeyFromCid(cid);
			if (!result.key) {
				setMessageFetchEncryptionKey(`Failed: fetch and key read for CID -> ${cid}`);
				setState(null);
				return;
			}

			setMessageFetchEncryptionKey('Success: fetched and recovered encryption key for study!');
			setState(result);
			return result;
		},
	});

	useEffect(() => {
		if (!cid?.length) {
			return;
		}
		setMessageReadContract(`Success: ZorpStudy.encryptionKey() read returned: ${cid}`);
	}, [cid])

	return (
		<>
			<p className={`irys_fetch_gpg_key irys_fetch_gpg_key__read_contract ${className}`}>{messageReadContract}</p>
			<p className={`irys_fetch_gpg_key irys_fetch_gpg_key__fetch_status ${className}`}>{messageFetchEncryptionKey}</p>
		</>
	);
}
