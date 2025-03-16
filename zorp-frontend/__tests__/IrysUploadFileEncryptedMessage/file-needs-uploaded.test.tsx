/**
 * @see {@link https://docs.irys.xyz/build/d/sdk/upload/upload}
 *
 * @TODO figure out how to make ViTest not share state between tests
 * @dev note these do work if one or the other is commented out
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as openpgp from 'openpgp';
import * as irysConfig from '@/lib/constants/irysConfig';
import type { fileFromUint8Array } from '@/lib/utils/file';
import type { getIrysResponseFromCid } from '@/lib/utils/irys';
import { cidFromFile } from '@/lib/utils/ipfs';
import type * as useIrys_type from '@/hooks/useIrys';
import promiseFromFileReader from '@/lib/utils/promiseFromFileReader';

import IrysUploadFileEncryptedMessage from '@/components/features/IrysUploadFileEncryptedMessage';

describe('IrysUploadFileEncryptedMessage attempts to uploade new encrypted file', () => {
	const queryClient = new QueryClient();

	const ogFile = globalThis.File;
	afterEach(() => {
		vi.resetAllMocks();
		globalThis.File = ogFile;
	});

	let cid: string;
	let encryptedMessage: Uint8Array;
	beforeEach(async () => {
		const gpgKeyParticipant = await openpgp.generateKey({
			userIDs: [{
				name: 'Jayne Cobb',
				email: 'jcobb@serenity-shipping.example.com',
			}],
			format: 'armored',
			type: 'rsa',
			passphrase: 'ICouldStandToHearALittleMore',
		}).then((serializedKeyPair) => {
			return openpgp.readKey({ armoredKey: serializedKeyPair.publicKey });
		});

		const gpgKeyStudy = await openpgp.generateKey({
			userIDs: [{
				name: 'Hands of Blue',
				email: 'BlueSunCorp@union-of-allied-planets.example.com',
			}],
			format: 'armored',
			type: 'rsa',
			passphrase: 'wat',
		}).then((serializedKeyPair) => {
			return openpgp.readKey({ armoredKey: serializedKeyPair.publicKey });
		});

		const file = new File(
			['Maybe I found the River you know'],
			'studyData.txt',
			{
				type: 'text/plain',
				lastModified: Date.now(),
			},
		);
		/* @ts-ignore */
		file.arrayBuffer = async () => new ArrayBuffer(file);

		cid = await cidFromFile(file);

		const buffer = await promiseFromFileReader({
			file,
			readerMethod: ({ reader, file }) => {
				reader.readAsArrayBuffer(file);
			},
		}).then(({ result }) => {
			return new Uint8Array(result as ArrayBuffer);
		});

		const createdmessage = await openpgp.createMessage({ binary: buffer });

		encryptedMessage = await openpgp.encrypt({
			message: createdmessage,
			encryptionKeys: [gpgKeyStudy, gpgKeyParticipant],
			format: 'binary',
		});
	});

	it('Mockery of `getIrysResponseFromCid` CID against Irys for file and `useIrys` must be used', async () => {
		const url = `${irysConfig.gatewayUrl.irys}/ipfs/${cid}`;

		const receipt = {
			id: 'wat',
		};

		vi.mock('@/hooks/useIrys', async (importOriginal) => {
			const useIrys = await importOriginal<typeof useIrys_type>();
			return {
				...useIrys,
				useIrysWebUploaderBuilderBaseEth: (...args: any[]) => {
					return {
						build: async (...args: any[]) => {
							return {
								uploader: {
									uploadData: async (...args: any[]) => {
										return { id: 'wat' };
									},
								},
							};
						},
					};
				},
			};
		});

		vi.mock('@/lib/utils/file', async (importOriginal) => {
			const utilsFile = await importOriginal<{fileFromUint8Array: typeof fileFromUint8Array}>();
			return {
				...utilsFile,
				fileFromUint8Array: (kwargs: {
					array: Uint8Array;
					name: string;
					options?: FilePropertyBag;
				}) => {
					const file = utilsFile.fileFromUint8Array(kwargs);
					/* @ts-ignore */
					file.arrayBuffer = async () => new ArrayBuffer(file);
					return file;
				},
			};
		});

		vi.mock('@/lib/utils/irys', async (importOriginal) => {
			const utilsIrys = await importOriginal<{getIrysResponseFromCid: typeof getIrysResponseFromCid}>();

			return {
				...utilsIrys,
				getIrysResponseFromCid: async (cid: string) => {
					return {
						ok: false,
					};
				},
			};
		});

		render(
			<QueryClientProvider client={queryClient}>
				<IrysUploadFileEncryptedMessage
					labelText={'Mocked -- IrysUploadFileEncryptedMessage -- File already uploaded'}
					setState={(state) => {
						expect(state).toEqual({
							cid,
							receipt,
						});
					}}
					encryptedMessage={encryptedMessage}
					irysBalance={41968}
				/>
			</QueryClientProvider>
		);

		const button = document.querySelector('button') as HTMLButtonElement;
		expect(button).toBeDefined();
		fireEvent.click(button);

		await waitFor(() => {
			const span = document.querySelector('span');
			expect(span).toBeDefined();
			/* @ts-ignore */
			expect(span.textContent).toBe(`Success: Uploded encrypted file to Irys?! JSON: '{ "id": "${receipt.id}", "cid": "${cid}", "url": "${url}" }'`);
		});
	});
});
