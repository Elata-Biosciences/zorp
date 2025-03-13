/**
 * @see {@link https://docs.irys.xyz/build/d/features/ipfs-cid#downloading-with-a-cid}
 * @see {@link https://docs.irys.xyz/build/d/downloading}
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type wagmiType from 'wagmi';
import type * as wagmiConfig from '@/lib/constants/wagmiConfig';
import type { IZorpStudy } from '@/lib/constants/wagmiContractConfig/IZorpStudy';
import type node_fetch_type from 'node-fetch';
import IrysFetchFileGpgKey from '@/components/features/IrysFetchFileGpgKey';

describe('IrysFetchFileGpgKey', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it('Mockery of `useReadContract` and `fetch` CID against Irys for file', () => {
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
				config: typeof wagmiConfig.wagmiConfig;
				functionName: string;
			}) => {
				console.warn('Mocked -- useReadContract ->', {
					abi,
					address,
					config,
					functionName,
				});

				return {
					data: '0xDEADBEEF',
				};
			};

			return { ...wagmi, useReadContract: useReadContractMocked };
		});

		vi.mock('node-fetch', async (importOriginal) => {
			const node_fetch = importOriginal<typeof node_fetch_type>();

			const fetchMocked = (...args: any[]) => {
				console.warn('Mocked -- fetch ->', { args });
			};

			return { ...node_fetch, default: fetchMocked };
		});

		expect(false).toBe(true);
	});
});
