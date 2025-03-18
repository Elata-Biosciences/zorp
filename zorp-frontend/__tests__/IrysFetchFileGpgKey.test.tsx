/**
 * @see {@link https://docs.irys.xyz/build/d/features/ipfs-cid#downloading-with-a-cid}
 * @see {@link https://docs.irys.xyz/build/d/downloading}
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type * as wagmiType from 'wagmi';
import type * as wagmiConfig from '@/lib/constants/wagmiConfig';
import type { IZorpStudy } from '@/lib/constants/wagmiContractConfig/IZorpStudy';
import type node_fetch_type from 'node-fetch';
import type { getGpgKeyFromCid } from '@/lib/utils/irys';
import * as openpgp from 'openpgp';
import type { Key, Subkey } from 'openpgp';
import { cidFromFile } from '@/lib/utils/ipfs';

import IrysFetchFileGpgKey from '@/components/features/IrysFetchFileGpgKey';

describe('IrysFetchFileGpgKey', () => {
	const queryClient = new QueryClient();

	afterEach(() => {
		vi.resetAllMocks();
	});

	let cid: string;
	let gpgKey: { file: File, key: Key | Subkey };
	beforeEach(async () => {
		const key = await openpgp.generateKey({
			userIDs: [{
				name: 'Hands of Blue',
				email: 'BlueSunCorp@union-of-allied-planets.example.com',
			}],
			format: 'armored',
			type: 'rsa',
			passphrase: 'wat',
		}).then(({ publicKey }) => {
			return openpgp.readKey({ armoredKey: publicKey });
		});

		const file = new File(
			[key.armor()],
			'armored.pub.pgp',
			{
				type: 'text/plain',
				lastModified: Date.now(),
			},
		);

		gpgKey = { file, key };

		cid = await cidFromFile(file);
	});

	it('Mockery of `useReadContract` and `getGpgKeyFromCid` CID against Irys for file', async () => {
		vi.mock('wagmi', async (importOriginal) => {
			const wagmi = await importOriginal<typeof wagmiType>();

			return {
				...wagmi,
				useReadContract: ({
					abi,
					address,
					config,
					functionName,
				}: {
					abi: typeof IZorpStudy.abi;
					address: `0x${string}`;
					config: typeof wagmiConfig.wagmiConfig;
					functionName: string;
				}) => {
					// console.warn('Mocked -- useReadContract ->', {
					// 	abi,
					// 	address,
					// 	config,
					// 	functionName,
					// });
					return {
						data: 'TODO: figure out how to share state set by `beforeEach` to here',
					};
				}
			};
		});

		vi.mock('@/lib/utils/irys', async (importOriginal) => {
			const utilsIrys = await importOriginal<{getGpgKeyFromCid: typeof getGpgKeyFromCid}>();

			return {
				...utilsIrys,
				getGpgKeyFromCid: async (cidRequested: string) => {
					// console.warn('Mocked -- getGpgKeyFromCid ->', { cid: cidRequested });
					return {
						key: '--- fake key --- is truethy but un-trustworthy --- fake key ---',
						response: new Response(),
					};
				},
			};
		});

		render(
			<QueryClientProvider client={queryClient}>
				<IrysFetchFileGpgKey
					setState={(study_encryption_key) => {
						expect(false).toBe(true);
					}}
				/>
			</QueryClientProvider>
		);

		await waitFor(() => {
			const irys_fetch_gpg_key__read_contract = document.querySelector('.irys_fetch_gpg_key__read_contract') as HTMLParagraphElement;
			expect(irys_fetch_gpg_key__read_contract).toBeDefined();
			expect(irys_fetch_gpg_key__read_contract.textContent).toBe('Success: ZorpStudy.encryptionKey() read returned: TODO: figure out how to share state set by `beforeEach` to here');
			// expect(irys_fetch_gpg_key__read_contract.textContent).toBe(`Success: ZorpStudy.encryptionKey() read returned: ${cid}`);

			const irys_fetch_gpg_key__fetch_status = document.querySelector('.irys_fetch_gpg_key__fetch_status') as HTMLParagraphElement;
			expect(irys_fetch_gpg_key__fetch_status).toBeDefined();
			expect(irys_fetch_gpg_key__fetch_status.textContent).toBe('Success: fetched and recovered encryption key for study!');
		});
	});
});
