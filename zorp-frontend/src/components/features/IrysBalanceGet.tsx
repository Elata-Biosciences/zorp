'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import { useAccount } from 'wagmi';
import { useIrysWebUploaderBuilderBaseEth } from '@/hooks/useIrys';
import { IoWallet, IoCheckmarkCircle, IoWarning } from 'react-icons/io5';

/**
 * @see {@link https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/fundAndUpload.ts#L33}
 * @see {@link https://github.com/Irys-xyz/provenance-toolkit/blob/master/app/utils/getIrys.ts#L107}
 * @see {@link https://github.com/wevm/wagmi/discussions/2405}
 * @see {@link https://docs.irys.xyz/build/d/sdk/setup#base-ethereum}
 * @see {@link https://docs.irys.xyz/build/programmability/connecting-to-testnet}
 */
export default function IrysBalanceGet({
	className = '',
	labelText = 'Check Irys balance',
	setState,
}: {
	className?: string;
	labelText: string;
	setState: (balance: null | number | BigNumber | bigint) => void;
}) {
	const [message, setMessage] = useState<string>('Connect your wallet to check Irys balance');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasBalance, setHasBalance] = useState<boolean>(false);
	const { address, isConnected } = useAccount();
	const irysWebUploaderBuilderBaseEth = useIrysWebUploaderBuilderBaseEth();

	const handleIrysBalanceGet = useCallback(async () => {
		if (!address) {
			setMessage('Please connect your wallet first');
			setState(null);
			setHasBalance(false);
			return;
		}

		if (!irysWebUploaderBuilderBaseEth) {
			setMessage('Waiting for Irys connection...');
			setState(null);
			setHasBalance(false);
			return;
		}

		setIsLoading(true);
		setMessage('Checking your Irys balance...');

		try {
			const irysUploaderWebBaseEth = await irysWebUploaderBuilderBaseEth.build();
			const balance = await irysUploaderWebBaseEth.getBalance(address);
			const balanceNumber = Number(balance);
			
			if (balanceNumber > 0) {
				setMessage(`Irys balance: ${balance} (sufficient)`);
				setHasBalance(true);
				setState(balance);
			} else {
				setMessage('Irys balance: 0 (insufficient - please fund your Irys account)');
				setHasBalance(false);
				setState(null);
			}
			
			return balance;
		} catch (error) {
			let errorMessage = 'Error checking balance: ';

			if (!!error && typeof error == 'object') {
				if ('message' in error) {
					errorMessage += error.message;
				} else if ('toString' in error) {
					errorMessage += error.toString();
				} else {
					errorMessage += `${error}`;
				}
			} else {
				errorMessage += `${error}`;
			}

			setMessage(errorMessage);
			setHasBalance(false);
			setState(null);
			console.error('IrysBalanceGet ->', { error, message: errorMessage });
			return error;
		} finally {
			setIsLoading(false);
		}
	}, [ address, irysWebUploaderBuilderBaseEth, setState ]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:items-center gap-3">
				<button
					onClick={async (event) => {
						event.stopPropagation();
						event.preventDefault();
						await handleIrysBalanceGet();
					}}
					disabled={!isConnected || isLoading}
					className={`
						inline-flex items-center justify-center px-4 py-2 rounded-lg font-sf-pro font-medium text-sm
						transition-all duration-200 shadow-sm
						${isConnected && !isLoading
							? 'bg-elataGreen text-white hover:bg-elataGreen/90 hover:shadow-md'
							: 'bg-gray2 text-gray3 cursor-not-allowed'
						}
					`}
				>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
							Checking...
						</>
					) : (
						<>
							<IoWallet className="w-4 h-4 mr-2" />
							Check Irys Balance
						</>
					)}
				</button>
				
				{hasBalance && (
					<div className="flex items-center text-elataGreen text-sm">
						<IoCheckmarkCircle className="w-4 h-4 mr-1" />
						<span>Balance confirmed</span>
					</div>
				)}
			</div>
			
			<div className={`text-sm font-sf-pro flex items-start gap-2 ${
				hasBalance ? 'text-elataGreen' : 
				message.includes('Error') ? 'text-accentRed' : 
				'text-gray3'
			}`}>
				{message.includes('Error') && <IoWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />}
				<span>{message}</span>
			</div>
		</div>
	);
}
