// TODO: maybe figure out a way to quite-down `WagmiProvider` logger stuff

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import { BigNumber } from 'bignumber.js';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/constants/wagmiConfig';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';

describe('Mockery of Irys `webIrys.getBalance`', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it('Calls setState as expected', async () => {
		const balance = 419.68;
		vi.mock('@irys/sdk', async (importOriginal) => {
			// console.warn('Mocking "@irys/sdk"');
			const irys_sdk = await importOriginal() as { [key:string]: unknown; };

			const WebIrys = function() {
				// console.warn('Mocked "@irys/sdk" -> WebIrys');

				/* @ts-ignore */
				this.ready = async () => {
					// console.warn('Mocked "@irys/sdk" -> async WebIrys.ready()');
					return {
						getBalance: async () => {
							const data = BigNumber(419.68);
							// console.warn('Mocked "@irys/sdk" -> async (await WebIrys.ready()).getBalance()', { data });
							return data;
						},
					};
				};
			}

			return { ...irys_sdk, WebIrys };
		});

		vi.mock('wagmi', async (importOriginal) => {
			console.warn('Mocking "wagmi"');
			const wagmi = await importOriginal() as { [key: string]: unknown };

			const useAccount = () => {
				const data = { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' };
				console.warn('Mocked "wagmi" -> useAccount', { data });
				return data;
			};

			return { ...wagmi, useAccount };
		});

		render(
			<WagmiProvider config={wagmiConfig}>
				<IrysBalanceGet
					labelText='Mocked -- IrysBalanceGet'
					setState={(balance: unknown) => {
						console.warn('Vitest mocked', {balance});

						expect(balance).toEqual(BigNumber(419.68));
					}}
				/>
			</WagmiProvider>
		);

		const button = screen.getByRole('button');
		expect(button).toBeDefined();
		await button.click();

		const span = document.querySelector('span');
		expect(span).toBeDefined();
		/* @ts-ignore */
		expect(span.textContent).toBe('Irys balance: 419.68');
	});
});
