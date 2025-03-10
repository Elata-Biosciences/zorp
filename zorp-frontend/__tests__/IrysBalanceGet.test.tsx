/**
 * @see {@link https://github.com/wevm/wagmi/discussions/577}
 * @see {@link https://nextjs.org/docs/app/building-your-application/testing/jest}
 * @see {@link https://stackoverflow.com/questions/50091438/jest-how-to-mock-one-specific-method-of-a-class}
 * @see {@link https://stackoverflow.com/questions/55342181/set-state-when-testing-functional-component-with-usestate-hook}
 * @see {@link https://stackoverflow.com/questions/64165138/how-to-mock-spy-usestate-hook-in-jest}
 * @see {@link https://stackoverflow.com/questions/68468203/why-am-i-getting-textencoder-is-not-defined-in-jest}
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ReactDOMClient from 'react-dom/client';
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import { act, useState } from 'react';
import { BigNumber } from 'bignumber.js';

// import '@testing-library/jest-dom';
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

// TODO: investigate why Jest no likes following tsconfig paths
import IrysBalanceGet from '@/components/features/IrysBalanceGet';

afterEach(() => {
	jest.restoreAllMocks();
});

test('it renders stuff', async () => {
	jest.mock('wagmi', () => {
		console.log('Mocking -- wagmi');
		return {
			/* @ts-ignore */
			...jest.requireActual('wagmi'),
			useAccount: (...args: any[]) => {
				console.log('Mocked -- wagmi.useAccount', { args });
				return {
					address: '0xDEADBEEF',
				};
			},
		};
	});

	jest.mock('@irys/sdk', () => {
		console.log('Mocking -- @irys/sdk');
		return {
			/* @ts-ignore */
			...jest.requireActual('@irys/sdk'),
			ready: async (...args: any[]) => {
				console.log('Mocked -- (@irys/sdk).ready()', { args });
				return {
					getBalance: async (...args: any[]) => {
						console.log('Mocked -- (@irys/sdk).ready().getBalance()', { args });
						return BigNumber(419.68);
					},
				};
			},
		};
	});

	/* @ts-ignore */
	render(<IrysBalanceGet setState={(balance) => {
		console.error({ balance });
		expect(balance).toEqual(-1);
	}} />);

});
