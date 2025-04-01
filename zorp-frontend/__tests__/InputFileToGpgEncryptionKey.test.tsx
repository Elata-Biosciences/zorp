
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as openpgp from 'openpgp';
import type { Key, Subkey } from 'openpgp';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import InputFileToGpgEncryptionKey from '@/components/features/InputFileToGpgEncryptionKey';

describe('InputFileToGpgEncryptionKey', () => {
	const queryClient = new QueryClient();

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('Recovers public armored PGP key from `input` file', async () => {
		const gpgKeyParticipant = await openpgp.generateKey({
			userIDs: [{
				name: 'Jayne Cobb',
				email: 'jcobb@serenity-shipping.example.com',
			}],
			format: 'armored',
			type: 'rsa',
			passphrase: 'ICouldStandToHearALittleMore',
		});

		const publicKey = gpgKeyParticipant.publicKey;

		render(
			<QueryClientProvider client={queryClient}>
				<InputFileToGpgEncryptionKey
					labelText={'Mocked -- InputFileToGpgEncryptionKey'}
					setState={async (state) => {
						expect(state?.file).toBeDefined();
						expect(state?.key).toBeDefined();

						/**
						 * @dev Note how _good_ MicroSoft™ TypeScript® can be when
						 * type-hints are totally honest, truly confidence inspiring!
						 */
						const { file, key } = state as unknown as { file: File; key: Subkey };

						expect(file).toBe(file);

						expect(key).toEqual(
							await openpgp.readKey({ armoredKey: gpgKeyParticipant.publicKey })
								.then((readKey) => { return readKey.getEncryptionKey() })
						);
					}}
				/>
			</QueryClientProvider>
		);

		const input = document.querySelector('input') as HTMLInputElement;
		expect(input).toBeDefined();

		const file = new File(
			[gpgKeyParticipant.publicKey.toString()],
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
			expect(span.textContent).toBe('Success: recovered GPG encryption key from file!');
		});
	});
});
