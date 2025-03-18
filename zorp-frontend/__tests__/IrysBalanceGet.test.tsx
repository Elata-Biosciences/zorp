// TODO: maybe figure out a way to quite-down `WagmiProvider` logger stuff

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BigNumber } from 'bignumber.js';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/constants/wagmiConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import type ethers_type from 'ethers';
import type * as useIrys_type from '@/hooks/useIrys';

describe('Mockery of Irys `webIrys.getBalance`', () => {
	const queryClient = new QueryClient();

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('Calls setState as expected', async () => {
		vi.mock('@/hooks/useIrys', async (importOriginal) => {
			const useIrys = await importOriginal<typeof useIrys_type>();
			return {
				...useIrys,
				useIrysWebUploaderBuilderBaseEth: (...args: any[]) => {
					return {
						build: async (...args: any[]) => {
							return {
								getBalance: async (...args: any[]) => {
									return 9001;
								},
							};
						},
					};
				},
			};
		});

		vi.mock('wagmi', async (importOriginal) => {
			const wagmi = await importOriginal() as { [key: string]: unknown };

			const useAccount = () => {
				const data = { address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' };
				return data;
			};

			return { ...wagmi, useAccount };
		});

		render(
			<QueryClientProvider client={queryClient}>
				<WagmiProvider config={wagmiConfig}>
					<IrysBalanceGet
						labelText='Mocked -- IrysBalanceGet'
						setState={(balance: unknown) => {
							expect(balance).toEqual(9001);
						}}
					/>
				</WagmiProvider>
			</QueryClientProvider>
		);

		const button = screen.getByRole('button');
		expect(button).toBeDefined();
		await button.click();

		await waitFor(() => {
			const span = document.querySelector('span');
			expect(span).toBeDefined();
			/* @ts-ignore */
			expect(span.textContent).toBe('Irys balance: 9001');
		});
	});
});
