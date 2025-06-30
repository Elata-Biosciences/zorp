'use client';

import React, { useCallback, useState, useEffect } from 'react';
import type { BigNumber } from 'bignumber.js';
import type { Key } from 'openpgp';
import { useAccount, useWriteContract, useTransactionReceipt } from 'wagmi';
import { useZorpContract } from '@/contexts/Contracts';
import ZorpFactoryAddressInput from '@/components/contracts/ZorpFactoryAddressInput';
import GpgEncryptionKeyFromInputFile from '@/components/features/GpgEncryptionKeyFromInputFile';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysUploadFileGpgKey from '@/components/features/IrysUploadFileGpgKey';
import * as config from '@/lib/constants/wagmiConfig';
import { 
	IoInformationCircle, 
	IoCheckmarkCircle, 
	IoWarning,
	IoKey,
	IoWallet,
	IoCloudUpload,
	IoFlask,
	IoHelpCircle,
	IoClose,
	IoArrowForward,
	IoShieldCheckmark
} from 'react-icons/io5';

interface HelpModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	content: React.ReactNode;
}

function HelpModal({ isOpen, onClose, title, content }: HelpModalProps) {
	// Lock body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = 'unset';
			};
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
			style={{ 
				position: 'fixed', 
				top: 0, 
				left: 0, 
				right: 0, 
				bottom: 0,
				zIndex: 9999
			}}
		>
			<div 
				className="h-full flex items-center justify-center p-2 sm:p-4"
				style={{ minHeight: '100vh' }}
			>
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-auto">
					<div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray2/30">
						<h3 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack pr-4">{title}</h3>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray1/20 rounded-full transition-colors duration-200 flex-shrink-0"
						>
							<IoClose className="w-5 h-5" />
						</button>
					</div>
					<div className="p-4 sm:p-6 overflow-y-auto flex-1">
						{content}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CreateStudyPage() {
	const addressFactoryAnvil = config.anvil.contracts.IZorpFactory[31337].address;

	// State management
	const [addressFactory, setAddressFactory] = useState<`0x${string}`>(addressFactoryAnvil);
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Key; }>(null);
	const [hash, setHash] = useState<undefined | `0x${string}`>(undefined);
	const [irysBalance, setIrysBalance] = useState<null | bigint | number | BigNumber>(null);
	const [irysUploadData, setIrysUploadData] = useState<null | { receipt: unknown; cid: string; }>(null);
	const [message, setMessage] = useState<string>('Follow the steps above to set up your research study');
	const [amount, setAmount] = useState<null | bigint>(null);
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [activeModal, setActiveModal] = useState<string | null>(null);

	const { writeContractAsync, isPending } = useWriteContract({
		config: config.wagmiConfig,
	});

	const { address, isConnected } = useAccount();
	const { abi: factoryAbi, address: factoryAddress, isReady: isFactoryReady } = useZorpContract('IZorpFactory');

	const handleZorpFactoryCreateStudyAmount = useCallback((amount: bigint) => {
		if (!amount || amount < BigInt(1)) {
			setMessage('Please enter a positive study deposit amount');
			setAmount(null);
			return;
		}
		setAmount(amount);
		setMessage('Study deposit amount set successfully');
	}, []);

	const handleZorpFactoryWriteCreateStudy = useCallback(() => {
		if (!isConnected) {
			setMessage('Please connect your wallet to continue');
			return;
		}

		if (!address?.toString().length) {
			setMessage('Wallet connection required');
			return;
		}

		if (!amount || amount < BigInt(1)) {
			setMessage('Please set a positive study deposit amount');
			return;
		}

		if (!irysUploadData || !irysUploadData.cid) {
			setMessage('Please upload your GPG key to Irys first');
			return;
		}

		if (!isFactoryReady || !factoryAbi?.length || !factoryAddress?.length) {
			setMessage('Unable to connect to ZORP Factory contract');
			return;
		}

		setMessage('Creating your study on the blockchain...');
		writeContractAsync({
			abi: factoryAbi,
			address: addressFactory,
			functionName: 'createStudy',
			args: [address.toString(), irysUploadData.cid.toString()],
			value: amount,
		}).then((hash) => {
			setHash(hash);
			setMessage('Study creation transaction sent! Waiting for confirmation...');
		}).catch((error) => {
			setMessage(`Error: ${error.message}`);
		});
	}, [
		factoryAbi,
		factoryAddress,
		isFactoryReady,
		addressFactory,
		amount,
		address,
		irysUploadData,
		isConnected,
		writeContractAsync,
	]);

	const { data: txResult } = useTransactionReceipt({
		query: {
			enabled: !!hash && isFactoryReady && !!amount && !!address && !!irysUploadData && !!isConnected,
		},
		hash,
	});

	// Help modal content
	const helpContent = {
		pgp: (
			<div className="space-y-4">
				<p className="text-gray3 font-sf-pro leading-relaxed">
					A PGP (Pretty Good Privacy) key pair consists of a public key and a private key that enable secure, encrypted communication.
				</p>
				<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
					<h4 className="font-semibold font-montserrat text-offBlack mb-2">Why PGP Keys?</h4>
					<ul className="space-y-1 text-gray3 font-sf-pro text-sm">
						<li>• Participants encrypt their data before submission</li>
						<li>• Only you (the researcher) can decrypt submitted data</li>
						<li>• Ensures complete privacy and security</li>
					</ul>
				</div>
				<div className="space-y-2">
					<h4 className="font-semibold font-montserrat text-offBlack">How to create PGP keys:</h4>
					<ol className="space-y-2 text-gray3 font-sf-pro text-sm pl-4">
						<li><strong>1. Install GPG:</strong> Download from <a href="https://gnupg.org/download/" target="_blank" rel="noopener noreferrer" className="text-elataGreen hover:underline">gnupg.org</a></li>
						<li><strong>2. Generate keys:</strong> Run <code className="bg-gray1/30 px-2 py-1 rounded text-xs">gpg --gen-key</code></li>
						<li><strong>3. Export public key:</strong> Run <code className="bg-gray1/30 px-2 py-1 rounded text-xs">gpg --export --armor your-email@example.com &gt; public.asc</code></li>
						<li><strong>4. Upload the public.asc file</strong> in the form below</li>
					</ol>
				</div>
			</div>
		),
		irys: (
			<div className="space-y-4">
				<p className="text-gray3 font-sf-pro leading-relaxed">
					Irys is a decentralized data storage network that ensures your study configuration is permanently stored and accessible.
				</p>
				<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
					<h4 className="font-semibold font-montserrat text-offBlack mb-2">Why Irys?</h4>
					<ul className="space-y-1 text-gray3 font-sf-pro text-sm">
						<li>• Permanent, tamper-proof storage</li>
						<li>• Decentralized and censorship-resistant</li>
						<li>• Integrated with ZORP protocol</li>
					</ul>
				</div>
				<div className="space-y-2">
					<h4 className="font-semibold font-montserrat text-offBlack">Getting Irys tokens:</h4>
					<ol className="space-y-2 text-gray3 font-sf-pro text-sm pl-4">
						<li><strong>1. Visit:</strong> <a href="https://irys.xyz/faucet" target="_blank" rel="noopener noreferrer" className="text-elataGreen hover:underline">irys.xyz</a></li>
						<li><strong>2. Connect your wallet</strong> to the Irys platform</li>
						<li><strong>3. Fund your Irys balance</strong> with a small amount of ETH</li>
						<li><strong>4. Return here</strong> and check your balance</li>
					</ol>
				</div>
			</div>
		),
		deposit: (
			<div className="space-y-4">
				<p className="text-gray3 font-sf-pro leading-relaxed">
					The study deposit is the total reward pool that will be distributed to valid participants upon study completion.
				</p>
				<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
					<h4 className="font-semibold font-montserrat text-offBlack mb-2">How it works:</h4>
					<ul className="space-y-1 text-gray3 font-sf-pro text-sm">
						<li>• You deposit ETH as the total reward pool</li>
						<li>• Participants submit encrypted data</li>
						<li>• You validate submissions</li>
						<li>• Valid participants share the reward pool equally</li>
					</ul>
				</div>
				<p className="text-gray3 font-sf-pro text-sm">
					<strong>Tip:</strong> Consider your target number of participants when setting the deposit amount. 
					For example, 0.1 ETH for 10 participants = 0.01 ETH per participant.
				</p>
			</div>
		)
	};

	// Check completion status for each step
	const stepStatus = {
		1: !!gpgKey,
		2: !!irysBalance && Number(irysBalance) > 0,
		3: !!irysUploadData?.cid,
		4: !!amount && amount > BigInt(0),
	};

	const allStepsComplete = Object.values(stepStatus).every(Boolean);

	// Update status message based on current progress
	useEffect(() => {
		if (allStepsComplete) {
			setMessage('All steps completed! Ready to create your research study');
			setCurrentStep(5); // Past all steps
		} else if (stepStatus[4]) {
			setMessage('Study deposit set. Complete the remaining steps to continue');
			setCurrentStep(4);
		} else if (stepStatus[3]) {
			setMessage('GPG key uploaded to Irys. Please set your study deposit amount');
			setCurrentStep(4);
		} else if (stepStatus[2]) {
			setMessage('Irys balance confirmed. Now upload your GPG key to the network');
			setCurrentStep(3);
		} else if (stepStatus[1]) {
			setMessage('GPG key loaded. Please check your Irys balance');
			setCurrentStep(2);
		} else {
			setMessage('Start by uploading your GPG public key for encryption');
			setCurrentStep(1);
		}
	}, [stepStatus, allStepsComplete]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-cream1 via-offCream to-cream2">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
				{/* Header */}
				<div className="text-center mb-8 sm:mb-12">
					<div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-elataGreen/10 rounded-2xl mb-4 sm:mb-6">
						<IoFlask className="w-6 h-6 sm:w-8 sm:h-8 text-elataGreen" />
					</div>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-montserrat text-offBlack mb-3 sm:mb-4 px-2">
						Create Research Study
					</h1>
					<p className="text-lg sm:text-xl text-gray3 font-sf-pro max-w-2xl mx-auto leading-relaxed px-4">
						Set up a new privacy-preserving research study with encrypted data collection and automatic reward distribution.
					</p>
				</div>

				{/* Progress Steps */}
				<div className="mb-8 sm:mb-12">
					<div className="flex items-center justify-center mb-4 sm:mb-6 overflow-x-auto pb-2">
						<div className="flex items-center min-w-max px-2">
						{[
							{ number: 1, label: 'GPG Key' },
							{ number: 2, label: 'Irys Balance' },
							{ number: 3, label: 'Upload Key' },
							{ number: 4, label: 'Set Deposit' }
						].map((step, index) => (
							<div key={step.number} className="flex flex-col items-center">
								<div className="flex items-center">
									<div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-300 ${
										stepStatus[step.number as keyof typeof stepStatus] 
											? 'bg-elataGreen border-elataGreen text-white' 
											: currentStep === step.number
											? 'border-elataGreen text-elataGreen bg-elataGreen/10'
											: 'border-gray2 text-gray3 bg-white'
									}`}>
										{stepStatus[step.number as keyof typeof stepStatus] ? (
											<IoCheckmarkCircle className="w-4 h-4 sm:w-5 sm:h-5" />
										) : (
											<span className="text-xs sm:text-sm font-semibold">{step.number}</span>
										)}
									</div>
									{index < 3 && (
										<div className={`h-0.5 w-12 sm:w-16 mx-2 sm:mx-4 transition-all duration-300 ${
											stepStatus[step.number as keyof typeof stepStatus] ? 'bg-elataGreen' : 'bg-gray2'
										}`} />
									)}
								</div>
								<span className={`text-xs font-medium font-sf-pro mt-2 transition-colors duration-300 text-center ${
									stepStatus[step.number as keyof typeof stepStatus] || currentStep === step.number
										? 'text-elataGreen' 
										: 'text-gray3'
								}`}>
									{step.label}
								</span>
							</div>
						))}
						</div>
					</div>
					
					<div className="text-center">
						<span className="text-sm font-medium font-sf-pro text-gray3">
							Step {currentStep} of 4
						</span>
					</div>
				</div>

				{/* Main Content */}
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray2/30 overflow-hidden">
					
					{/* Step 1: GPG Key */}
					<div className="p-4 sm:p-8 border-b border-gray2/30">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
							<div className="flex items-start space-x-3 sm:space-x-4">
								<div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 flex-shrink-0 ${
									stepStatus[1] ? 'bg-elataGreen text-white' : 'bg-elataGreen/10 text-elataGreen'
								}`}>
									<IoKey className="w-5 h-5 sm:w-6 sm:h-6" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack">
										Upload Public GPG Key
									</h3>
									<p className="text-gray3 font-sf-pro text-sm sm:text-base">
										Participants will use this key to encrypt their data submissions
									</p>
								</div>
							</div>
							<button
								onClick={() => setActiveModal('pgp')}
								className="flex items-center text-elataGreen hover:text-offBlack transition-colors duration-200 self-start sm:self-auto"
							>
								<IoHelpCircle className="w-5 h-5 mr-1" />
								<span className="text-sm font-medium">Need help?</span>
							</button>
						</div>
						
						<div className="bg-gray1/20 rounded-xl p-4 sm:p-6">
							<GpgEncryptionKeyFromInputFile
								labelText=""
								setState={setGpgKey}
							/>
							{stepStatus[1] && (
								<div className="mt-4 flex items-center text-elataGreen">
									<IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0" />
									<span className="text-sm font-medium">GPG key loaded successfully</span>
								</div>
							)}
						</div>
					</div>

					{/* Step 2: Irys Balance */}
					<div className="p-4 sm:p-8 border-b border-gray2/30">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
							<div className="flex items-start space-x-3 sm:space-x-4">
								<div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 flex-shrink-0 ${
									stepStatus[2] ? 'bg-elataGreen text-white' : 'bg-elataGreen/10 text-elataGreen'
								}`}>
									<IoWallet className="w-5 h-5 sm:w-6 sm:h-6" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack">
										Check Irys Balance
									</h3>
									<p className="text-gray3 font-sf-pro text-sm sm:text-base">
										Verify you have sufficient balance to store your study configuration
									</p>
								</div>
							</div>
							<button
								onClick={() => setActiveModal('irys')}
								className="flex items-center text-elataGreen hover:text-offBlack transition-colors duration-200 self-start sm:self-auto"
							>
								<IoHelpCircle className="w-5 h-5 mr-1" />
								<span className="text-sm font-medium">Need help?</span>
							</button>
						</div>
						
						<div className="bg-gray1/20 rounded-xl p-4 sm:p-6">
							<IrysBalanceGet
								labelText=""
								setState={setIrysBalance}
							/>
							{stepStatus[2] && (
								<div className="mt-4 flex items-center text-elataGreen">
									<IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0" />
									<span className="text-sm font-medium">Sufficient Irys balance confirmed</span>
								</div>
							)}
						</div>
					</div>

					{/* Step 3: Upload to Irys */}
					<div className="p-4 sm:p-8 border-b border-gray2/30">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
							<div className="flex items-start space-x-3 sm:space-x-4">
								<div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 flex-shrink-0 ${
									stepStatus[3] ? 'bg-elataGreen text-white' : 'bg-elataGreen/10 text-elataGreen'
								}`}>
									<IoCloudUpload className="w-5 h-5 sm:w-6 sm:h-6" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack">
										Upload to Irys Network
									</h3>
									<p className="text-gray3 font-sf-pro text-sm sm:text-base">
										Store your GPG key permanently on the decentralized network
									</p>
								</div>
							</div>
						</div>
						
						<div className="bg-gray1/20 rounded-xl p-4 sm:p-6">
							<IrysUploadFileGpgKey
								labelText=""
								setState={setIrysUploadData}
								gpgKey={gpgKey}
								irysBalance={irysBalance}
							/>
							{stepStatus[3] && (
								<div className="mt-4 flex items-center text-elataGreen">
									<IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0" />
									<span className="text-sm font-medium">GPG key uploaded to Irys successfully</span>
								</div>
							)}
						</div>
					</div>

					{/* Step 4: Study Deposit */}
					<div className="p-4 sm:p-8">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
							<div className="flex items-start space-x-3 sm:space-x-4">
								<div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 flex-shrink-0 ${
									stepStatus[4] ? 'bg-elataGreen text-white' : 'bg-elataGreen/10 text-elataGreen'
								}`}>
									<IoShieldCheckmark className="w-5 h-5 sm:w-6 sm:h-6" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack">
										Set Study Deposit
									</h3>
									<p className="text-gray3 font-sf-pro text-sm sm:text-base">
										Define the total reward pool for study participants
									</p>
								</div>
							</div>
							<button
								onClick={() => setActiveModal('deposit')}
								className="flex items-center text-elataGreen hover:text-offBlack transition-colors duration-200 self-start sm:self-auto"
							>
								<IoHelpCircle className="w-5 h-5 mr-1" />
								<span className="text-sm font-medium">Need help?</span>
							</button>
						</div>
						
						<div className="bg-gray1/20 rounded-xl p-4 sm:p-6">
							<label className="block text-sm font-medium font-sf-pro text-offBlack mb-3">
								Study Deposit Amount (ETH)
							</label>
							<input
								type="number"
								step="0.001"
								min="0"
								placeholder="0.1"
								className="w-full px-4 py-3 border border-gray2 rounded-xl focus:ring-2 focus:ring-elataGreen/50 focus:border-elataGreen transition-all duration-200 font-sf-pro text-base"
								onChange={(event) => {
									event.stopPropagation();
									event.preventDefault();
									const value = parseFloat(event.target.value);
									if (value && value > 0) {
										handleZorpFactoryCreateStudyAmount(BigInt(Math.floor(value * 1e18)));
									}
								}}
							/>
							{stepStatus[4] && (
								<div className="mt-4 flex items-center text-elataGreen">
									<IoCheckmarkCircle className="w-4 h-4 mr-2 flex-shrink-0" />
									<span className="text-sm font-medium">Study deposit amount set</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Status Message */}
				<div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-xl border border-gray2/30 shadow-lg">
					<div className="flex items-start">
						<div className="flex items-center justify-center w-6 h-6 bg-elataGreen/10 rounded-full mr-3 mt-0.5 flex-shrink-0">
							<IoInformationCircle className="w-4 h-4 text-elataGreen" />
						</div>
						<div className="min-w-0 flex-1">
							<h4 className="text-sm font-semibold font-montserrat text-offBlack mb-1">Status</h4>
							<span className="text-gray3 font-sf-pro leading-relaxed text-sm sm:text-base break-words">{message}</span>
						</div>
					</div>
				</div>

				{/* Create Study Button */}
				<div className="mt-6 sm:mt-8 flex flex-col items-center">
					<button
						onClick={handleZorpFactoryWriteCreateStudy}
						disabled={!allStepsComplete || isPending}
						className={`w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-12 py-4 rounded-xl sm:rounded-none shadow-lg font-sf-pro font-medium text-base sm:text-lg transition-all duration-300 ${
							allStepsComplete && !isPending
								? 'bg-elataGreen text-white hover:bg-elataGreen/90 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1'
								: 'bg-gray2 text-gray3 cursor-not-allowed'
						}`}
					>
						{isPending ? (
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
						) : (
							<IoFlask className="w-5 h-5 mr-3" />
						)}
						{isPending ? 'Creating Study...' : 'Create Study'}
						{!isPending && <IoArrowForward className="w-5 h-5 ml-3" />}
					</button>
					
					{!allStepsComplete && (
						<p className="mt-4 text-sm text-gray3 font-sf-pro text-center max-w-md px-4">
							Please complete all steps above to create your study
						</p>
					)}
				</div>

				{/* Transaction Results */}
				{hash && (
					<div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-elataGreen/10 border border-elataGreen/20 rounded-xl">
						<h4 className="font-semibold font-montserrat text-offBlack mb-3">Transaction Details</h4>
						<div className="space-y-3 text-sm font-sf-pro">
							<div className="bg-white rounded-lg p-4">
								<span className="text-gray3 block mb-1">Transaction Hash:</span>
								<span className="font-mono text-elataGreen break-all text-xs sm:text-sm">{hash}</span>
							</div>
							{txResult && (
								<div className="bg-white rounded-lg p-4">
									<span className="text-gray3 block mb-1">Study Address:</span>
									<span className="font-mono text-elataGreen break-all text-xs sm:text-sm">
										{txResult?.logs?.filter((log) => log?.address != txResult?.to)?.at(0)?.address}
									</span>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Help Modals */}
			<HelpModal
				isOpen={activeModal === 'pgp'}
				onClose={() => setActiveModal(null)}
				title="Understanding PGP Keys"
				content={helpContent.pgp}
			/>
			
			<HelpModal
				isOpen={activeModal === 'irys'}
				onClose={() => setActiveModal(null)}
				title="About Irys Network"
				content={helpContent.irys}
			/>
			
			<HelpModal
				isOpen={activeModal === 'deposit'}
				onClose={() => setActiveModal(null)}
				title="Study Deposit Explained"
				content={helpContent.deposit}
			/>
		</div>
	);
}
