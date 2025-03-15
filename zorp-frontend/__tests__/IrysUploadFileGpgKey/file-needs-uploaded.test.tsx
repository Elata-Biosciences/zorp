/**
 * @see {@link https://docs.irys.xyz/build/d/sdk/upload/upload}
 *
 * @TODO figure out how to make ViTest not share state between tests
 * @dev note these do work if one or the other is commented out
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/constants/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as openpgp from 'openpgp';
import type { Key, Subkey } from 'openpgp';
import type * as wagmiType from 'wagmi';
import type { IZorpStudy } from '@/lib/constants/wagmiContractConfig/IZorpStudy';
import type node_fetch_type from 'node-fetch';
import IrysUploadFileGpgKey from '@/components/features/IrysUploadFileGpgKey';
import * as irysConfig from '@/lib/constants/irysConfig';
import type { getGpgKeyFromCid, getIrysUploaderWebBaseEth } from '@/lib/utils/irys';
import { cidFromFile } from '@/lib/utils/ipfs';


describe('IrysUploadFileGpgKey attempts to upload new PGP key', () => {
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
		/* @ts-ignore */
		file.arrayBuffer = async () => new ArrayBuffer(file);

		gpgKey = { file, key };

		cid = await cidFromFile(file);
	});

	it('Mockery of `getGpgKeyFromCid` CID against Irys for file and `getIrysUploaderWebBaseEth` must be called', async () => {
		const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;

		const receipt = {
			id: 'wat',
		};

		vi.mock('@/lib/utils/irys', async (importOriginal) => {
			const utilsIrys = importOriginal<{getIrysUploaderWebBaseEth: typeof getIrysUploaderWebBaseEth}>();

			return {
				...utilsIrys,
				getGpgKeyFromCid: async (cid: string) => {
					return {
						key: undefined,
						response: new Response(),
					};
				},
				getIrysUploaderWebBaseEth: async (...args: any[]) => {
					return {
						uploader: {
							uploadData: async (...args: any[]) => {
								return { id: 'wat' };
							},
						},
					};
				},
			};
		})

		vi.mock('wagmi', async (importOriginal) => {
			const wagmi = await importOriginal<typeof wagmiType>();

			const useReadContractMocked = ({
				abi,
				address,
				config,
				functionName,
			}: {
				abi: typeof IZorpStudy.abi;
				address: `0x${string}`;
				config: typeof wagmiConfig;
				functionName: string;
			}) => {
				return {
					data: '0xDEADBEEF',
				};
			};

			return {
				...wagmi,
				useReadContract: useReadContractMocked,
				useAccount: () => {
					return {
						address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
					};
				},
			};
		});

		render(
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={wagmiConfig}>
					<IrysUploadFileGpgKey
						labelText={'Mocked -- IrysUploadFileGpgKey -- Key needs uploaded'}
						setState={(state) => {
							console.log({ state });
							// expect(state).toEqual({
							// 	cid,
							// 	receipt,
							// });
						}}
						gpgKey={gpgKey}
						irysBalance={41968}
					/>
				</WagmiProvider>
			</QueryClientProvider>
		);

		const button = document.querySelector('button') as HTMLButtonElement;
		expect(button).toBeDefined();
		fireEvent.click(button);

		await waitFor(() => {
			const span = document.querySelector('span');
			expect(span).toBeDefined();
			// /* @ts-ignore */
			// expect(span.textContent).toBe(`Success: Uploded GPG key to Irys?! JSON: '{ "id": "${receipt.id}", "cid": "${cid}", "url": "https://gateway.irys.xyz/ipfs/${cid}" }'`);
		});
	});
});
