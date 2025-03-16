/**
 * @see {@link https://dev.to/akirakashihara/how-to-mock-filelist-on-vitest-or-jest-4494}
 * @see {@link https://github.com/openpgpjs/openpgpjs/issues/1036}
 * @see {@link https://github.com/vitest-dev/vitest/issues/4043}
 * @see ../.vitest/setupTextEncoding.ts
 * @see {@link https://github.com/testing-library/react-testing-library/issues/93}
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as openpgp from 'openpgp';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InputFileToEncryptedMessage from '@/components/features/InputFileToEncryptedMessage';

describe('InputFileToEncryptedMessage', () => {
	const queryClient = new QueryClient();

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('Encrypts `input` file with provided public PGP keys', async () => {
		const gpgKeyParticipant = await openpgp.generateKey({
			userIDs: [{
				name: 'Jayne Cobb',
				email: 'jcobb@serenity-shipping.example.com',
			}],
			format: 'armored',
			type: 'rsa',
			passphrase: 'ICouldStandToHearALittleMore',
		});

		const gpgKeyStudy = await openpgp.generateKey({
			userIDs: [{
				name: 'Hands of Blue',
				email: 'BlueSunCorp@union-of-allied-planets.example.com',
			}],
			format: 'armored',
			type: 'rsa',
			passphrase: 'wat',
		});

		render(
			<QueryClientProvider client={queryClient}>
				<InputFileToEncryptedMessage
					labelText={'Mocked -- InputFileToEncryptedMessage'}
					setState={async (study_encrypted_message: null | Uint8Array) => {
						gpgKeyStudy_can_decrypt_message: {
							const { data } = await openpgp.decrypt({
								/* Works when message was encrypted with `{ format: 'armored' }` */
								// message: await openpgp.readMessage({ armoredMessage: study_encrypted_message }),

								/* Works when message was encrypted with `{ format: 'binary' }` */
								message: await openpgp.readMessage({ binaryMessage: study_encrypted_message }),

								decryptionKeys: await openpgp.decryptKey({
									privateKey: await openpgp.readPrivateKey({
										armoredKey: gpgKeyStudy.privateKey,
									}),
									passphrase: 'wat',
								}),

								config: {
									allowInsecureDecryptionWithSigningKeys: true,
								},
							});

							expect(data).toBe('Maybe I found the River you know');
						};

						gpgKeyParticipant_can_decrypt_message: {
							const { data } = await openpgp.decrypt({
								/* Works when message was encrypted with `{ format: 'armored' }` */
								// message: await openpgp.readMessage({ armoredMessage: study_encrypted_message }),

								/* Works when message was encrypted with `{ format: 'binary' }` */
								message: await openpgp.readMessage({ binaryMessage: study_encrypted_message }),

								decryptionKeys: await openpgp.decryptKey({
									privateKey: await openpgp.readPrivateKey({
										armoredKey: gpgKeyParticipant.privateKey,
									}),
									passphrase: 'ICouldStandToHearALittleMore',
								}),

								config: {
									allowInsecureDecryptionWithSigningKeys: true,
								},
							});

							expect(data).toBe('Maybe I found the River you know');
						};
					}}
					gpgKey={{
						file: new File(
							[gpgKeyParticipant.publicKey.toString()],
							'Jayne-Cobb.pub.pgp',
							{
								type: 'text/plain',
								lastModified: Date.now(),
							},
						),
						key: await openpgp.readKey({ armoredKey: gpgKeyParticipant.publicKey }),
					}}
					encryptionKey={{
						response: new Response(),
						key: await openpgp.readKey({ armoredKey: gpgKeyStudy.publicKey }),
					}}
				/>
			</QueryClientProvider>
		);

		const input = document.querySelector('input') as HTMLInputElement;
		expect(input).toBeDefined();

		const file = new File(
			['Maybe I found the River you know'],
			'studyData.txt',
			{
				type: 'text/plain',
				lastModified: Date.now(),
			},
		);

		Object.defineProperty(input, 'files', {
			value: [file]
		});
		fireEvent.change(input);

		await waitFor(() => {
			const span = document.querySelector('span');
			expect(span).toBeDefined();
			/* @ts-ignore */
			expect(span.textContent).toBe('Success: encrypted file with provided GPG keys?!');
		});
	});
});
