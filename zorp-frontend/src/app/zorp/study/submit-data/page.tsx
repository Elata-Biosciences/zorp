'use client';

import { useCallback, useState, useEffect } from 'react';
import type { BigNumber } from 'bignumber.js';
import type { Key } from 'openpgp';
import { useAccount, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import EncryptedMessageFromInputFile from '@/components/features/EncryptedMessageFromInputFile';
import GpgEncryptionKeyFromInputFile from '@/components/features/GpgEncryptionKeyFromInputFile';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysFetchFileGpgKey from '@/components/features/IrysFetchFileGpgKey';
import IrysUploadFileEncryptedMessage from '@/components/features/IrysUploadFileEncryptedMessage'
import * as config from '@/lib/constants/wagmiConfig';
import { 
	IoInformationCircle, 
	IoCheckmarkCircle, 
	IoWarning,
	IoKey,
	IoWallet,
	IoCloudUpload,
	IoDocumentText,
	IoHelpCircle,
	IoClose,
	IoArrowForward,
	IoShieldCheckmark,
	IoSend
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

export default function ZorpStudySubmitData() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;
	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);

	// TODO: consider reducing need of keeping both `Key` and `File` in memory at same time
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Key; }>(null);
	const [irysBalance, setIrysBalance] = useState<null | bigint | number | BigNumber>(null);
	const [irysUploadData, setIrysUploadData] = useState<null | { receipt: unknown; cid: string; }>(null);
	const [encryptionKey, setEncryptionKey] = useState<null | { response: Response; key: Key; }>(null);
	const [encryptedMessage, setEncryptedMessage] = useState<null | Uint8Array>(null);
	const [message, setMessage] = useState<string>('Follow the steps above to submit your data to a study');
	const [activeModal, setActiveModal] = useState<string | null>(null);

	const { writeContractAsync, isPending } = useWriteContract({
		config: config.wagmiConfig,
	});

	const { address, isConnected } = useAccount();
	const { contracts } = useContracts();

	// Check completion status for each step
	const stepStatus = {
		1: !!gpgKey,
		2: !!irysBalance && Number(irysBalance) > 0,
		3: !!addressStudy && addressStudy !== addressStudyAnvil, // Custom address set
		4: !!encryptionKey,
		5: !!encryptedMessage,
		6: !!irysUploadData?.cid,
	};

	const allStepsComplete = Object.values(stepStatus).every(Boolean);

	// Update status message based on current progress
	useEffect(() => {
		if (allStepsComplete) {
			setMessage('All steps completed! Ready to submit your data to the study');
		} else if (stepStatus[6]) {
			setMessage('Data uploaded to Irys. Ready to submit to the study!');
		} else if (stepStatus[5]) {
			setMessage('Data encrypted successfully. Now upload to Irys network');
		} else if (stepStatus[4]) {
			setMessage('Study encryption key retrieved. Choose your data file to encrypt');
		} else if (stepStatus[3]) {
			setMessage('Study found! Retrieving encryption key...');
		} else if (stepStatus[2]) {
			setMessage('Irys balance confirmed. Enter the study address to participate');
		} else if (stepStatus[1]) {
			setMessage('GPG key loaded. Please check your Irys balance');
		} else {
			setMessage('Start by uploading the study GPG public key');
		}
	}, [stepStatus, allStepsComplete]);

	const handleZorpStudySubmitData = useCallback(() => {
		if (!isConnected) {
			setMessage('Please connect your wallet to submit data');
			return;
		}

		if (!address?.toString().length) {
			setMessage('Wallet connection required');
			return;
		}

		if (!irysUploadData || !irysUploadData.cid || !irysUploadData.receipt) {
			setMessage('Please upload your encrypted data to Irys first');
			return;
		}

		if (!contracts?.IZorpStudy?.abi || !Object.keys(contracts.IZorpStudy?.abi || []).length || !addressStudy.length) {
			setMessage('Unable to connect to study contract');
			return;
		}

		setMessage('Submitting your data to the study...');
		writeContractAsync({
			abi: contracts.IZorpStudy?.abi || [],
			address: addressStudy,
			functionName: 'submitData',
			args: [
				address.toString(),
				irysUploadData.cid.toString(),
			],
		}).then((writeContractData) => {
			setMessage(`Data submitted successfully! Transaction: ${writeContractData}`);
		}).catch((error) => {
			setMessage(`Error submitting data: ${error.message}`);
		});
	}, [
		contracts,
		address,
		addressStudy,
		irysUploadData,
		isConnected,
		writeContractAsync,
	]);

	// Help modal content
	const helpContent = {
		pgp: (
			<div className="space-y-4">
				<p className="text-gray3 font-sf-pro leading-relaxed">
					You need the study public GPG key to encrypt your data before submission. This ensures only the researcher can read your data.
				</p>
				<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
					<h4 className="font-semibold font-montserrat text-offBlack mb-2">Why is this needed?</h4>
					<ul className="space-y-1 text-gray3 font-sf-pro text-sm">
						<li>• Ensures your data remains private</li>
						<li>• Only the researcher can decrypt your submission</li>
						<li>• Protects your information during transmission</li>
					</ul>
				</div>
			</div>
		),
		study: (
			<div className="space-y-4">
				<p className="text-gray3 font-sf-pro leading-relaxed">
					The study address is a unique blockchain address where your encrypted data will be submitted. Get this from the researcher.
				</p>
				<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
					<h4 className="font-semibold font-montserrat text-offBlack mb-2">Important:</h4>
					<ul className="space-y-1 text-gray3 font-sf-pro text-sm">
						<li>• Each study has a unique address</li>
						<li>• Double-check the address with the researcher</li>
						<li>• Wrong address means your data will not be received</li>
					</ul>
				</div>
			</div>
		),
		data: (
			<div className="space-y-4">
				<p className="text-gray3 font-sf-pro leading-relaxed">
					Upload the data file you want to submit to the study. This could be EEG data, survey responses, or any research data.
				</p>
				<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
					<h4 className="font-semibold font-montserrat text-offBlack mb-2">Data Privacy:</h4>
					<ul className="space-y-1 text-gray3 font-sf-pro text-sm">
						<li>• Your file is encrypted before leaving your device</li>
						<li>• Only you and the researcher can access the content</li>
						<li>• The encrypted data is stored securely on IPFS</li>
					</ul>
				</div>
			</div>
		)
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-cream1 via-offCream to-cream2">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
				{/* Header */}
				<div className="text-center mb-10 sm:mb-16">
					<div className="inline-flex items-center justify-center w-14 h-14 sm:w-18 sm:h-18 bg-elataGreen/10 rounded-2xl mb-6 sm:mb-8">
						<IoSend className="w-7 h-7 sm:w-9 sm:h-9 text-elataGreen" />
					</div>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-montserrat text-offBlack mb-4 sm:mb-6 px-2">
						Submit Study Data
					</h1>
					<p className="text-lg sm:text-xl text-gray3 font-sf-pro max-w-2xl mx-auto leading-relaxed px-4 mb-8">
						Participate in research studies by securely submitting your encrypted data and earning ETH rewards.
					</p>
					
					{/* Process Overview */}
					<div className="bg-elataGreen/5 border border-elataGreen/20 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
						<div className="flex items-start">
							<IoInformationCircle className="w-6 h-6 text-elataGreen mt-1 mr-4 flex-shrink-0" />
							<div className="text-left">
								<h3 className="font-semibold font-montserrat text-offBlack mb-3">How This Works</h3>
								<p className="text-gray3 font-sf-pro text-sm sm:text-base leading-relaxed">
									Your data is encrypted on your device before being uploaded to a decentralized network. Only the researcher can decrypt and access your submission. 
									This process ensures your privacy while enabling valuable research.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray2/20 overflow-hidden">
					
					{/* Step 1: GPG Key */}
					<div className="p-6 sm:p-10 border-b border-gray2/20">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-6 sm:space-y-0">
							<div className="flex items-start space-x-4 sm:space-x-6">
								<div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 flex-shrink-0 ${
									stepStatus[1] ? 'bg-elataGreen text-white shadow-lg' : 'bg-elataGreen/10 text-elataGreen'
								}`}>
									<span className="text-base sm:text-lg font-bold">1</span>
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-2">
										Upload Study GPG Key
									</h3>
									<p className="text-gray3 font-sf-pro text-base sm:text-lg mb-4 leading-relaxed">
										Get the public GPG key from the researcher to encrypt your data
									</p>
									<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
										<p className="text-elataGreen font-sf-pro text-sm leading-relaxed">
											<strong>What this does:</strong> The GPG key acts like a digital lock. Your data will be encrypted (locked) using this key, 
											and only the researcher with the matching private key can unlock and read your data.
										</p>
									</div>
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
						
						<div className="bg-gray1/10 rounded-xl p-6">
							<GpgEncryptionKeyFromInputFile
								labelText=""
								setState={setGpgKey}
							/>
							{stepStatus[1] ? (
								<div className="mt-6 flex items-center text-elataGreen bg-elataGreen/10 rounded-lg p-3">
									<IoCheckmarkCircle className="w-5 h-5 mr-3 flex-shrink-0" />
									<span className="text-sm font-medium">GPG key loaded successfully - Ready to encrypt your data securely</span>
								</div>
							) : (
								<div className="mt-6 text-gray3 text-sm bg-gray1/20 rounded-lg p-3">
									<strong>Next:</strong> The researcher should provide you with a .asc, .gpg, or .pub file containing their public key.
								</div>
							)}
						</div>
					</div>

					{/* Step 2: Irys Balance */}
					<div className="p-6 sm:p-10 border-b border-gray2/20">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-6 sm:space-y-0">
							<div className="flex items-start space-x-4 sm:space-x-6">
								<div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 flex-shrink-0 ${
									stepStatus[2] ? 'bg-elataGreen text-white shadow-lg' : 'bg-elataGreen/10 text-elataGreen'
								}`}>
									<span className="text-base sm:text-lg font-bold">2</span>
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-2">
										Check Irys Balance
									</h3>
									<p className="text-gray3 font-sf-pro text-base sm:text-lg mb-4 leading-relaxed">
										Verify you have sufficient balance to store your encrypted data permanently
									</p>
									<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
										<p className="text-elataGreen font-sf-pro text-sm leading-relaxed">
											<strong>About Irys:</strong> Irys is a decentralized data storage network that ensures your encrypted data 
											stays available forever. A small fee (usually under $0.01) covers permanent storage costs.
										</p>
									</div>
								</div>
							</div>
						</div>
						
						<div className="bg-gray1/10 rounded-xl p-6">
							<IrysBalanceGet
								labelText=""
								setState={setIrysBalance}
							/>
							{stepStatus[2] ? (
								<div className="mt-6 flex items-center text-elataGreen bg-elataGreen/10 rounded-lg p-3">
									<IoCheckmarkCircle className="w-5 h-5 mr-3 flex-shrink-0" />
									<span className="text-sm font-medium">Balance confirmed - You can afford to store your data permanently</span>
								</div>
							) : (
								<div className="mt-6 text-gray3 text-sm bg-gray1/20 rounded-lg p-3">
									<strong>Why needed:</strong> Storing data permanently on a decentralized network requires a small fee to cover infrastructure costs.
								</div>
							)}
						</div>
					</div>

					{/* Step 3: Study Address */}
					<div className="p-6 sm:p-10 border-b border-gray2/20">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-6 sm:space-y-0">
							<div className="flex items-start space-x-4 sm:space-x-6">
								<div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 flex-shrink-0 ${
									stepStatus[3] ? 'bg-elataGreen text-white shadow-lg' : 'bg-elataGreen/10 text-elataGreen'
								}`}>
									<span className="text-base sm:text-lg font-bold">3</span>
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-2">
										Enter Study Address
									</h3>
									<p className="text-gray3 font-sf-pro text-base sm:text-lg mb-4 leading-relaxed">
										Provide the blockchain address where your encrypted data will be submitted
									</p>
									<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
										<p className="text-elataGreen font-sf-pro text-sm leading-relaxed">
											<strong>Important:</strong> This address identifies the specific research study on the blockchain. 
											Double-check this address with the researcher - wrong address means your data will not reach the study.
										</p>
									</div>
								</div>
							</div>
							<button
								onClick={() => setActiveModal('study')}
								className="flex items-center text-elataGreen hover:text-offBlack transition-colors duration-200 self-start sm:self-auto"
							>
								<IoHelpCircle className="w-5 h-5 mr-1" />
								<span className="text-sm font-medium">Need help?</span>
							</button>
						</div>
						
						<div className="bg-gray1/10 rounded-xl p-6">
							<ZorpStudyAddressInput
								disabled={!isConnected}
								setState={setAddressStudy}
							/>
							{stepStatus[3] ? (
								<div className="mt-6 flex items-center text-elataGreen bg-elataGreen/10 rounded-lg p-3">
									<IoCheckmarkCircle className="w-5 h-5 mr-3 flex-shrink-0" />
									<span className="text-sm font-medium">Study found - Connected to the research study smart contract</span>
								</div>
							) : (
								<div className="mt-6 text-gray3 text-sm bg-gray1/20 rounded-lg p-3">
									<strong>Get this from:</strong> The researcher should provide this blockchain address when inviting you to participate.
								</div>
							)}
						</div>
					</div>

					{/* Step 4: Fetch GPG Key */}
					<div className="p-6 sm:p-10 border-b border-gray2/20">
						<div className="flex items-start space-x-4 sm:space-x-6 mb-6 sm:mb-8">
							<div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 flex-shrink-0 ${
								stepStatus[4] ? 'bg-elataGreen text-white shadow-lg' : 'bg-elataGreen/10 text-elataGreen'
							}`}>
								<span className="text-base sm:text-lg font-bold">4</span>
							</div>
							<div className="min-w-0 flex-1">
								<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-2">
									Verify Study Encryption Key
								</h3>
								<p className="text-gray3 font-sf-pro text-base sm:text-lg mb-4 leading-relaxed">
									Automatically verify the encryption key matches what is stored in the study contract
								</p>
								<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
									<p className="text-elataGreen font-sf-pro text-sm leading-relaxed">
										<strong>Security check:</strong> This step confirms that the GPG key you uploaded matches the one 
										the researcher has registered for this study, ensuring your data will be encrypted correctly.
									</p>
								</div>
							</div>
						</div>
						
						<div className="bg-gray1/10 rounded-xl p-6">
							<IrysFetchFileGpgKey addressStudy={addressStudy} setState={setEncryptionKey} />
							{stepStatus[4] ? (
								<div className="mt-6 flex items-center text-elataGreen bg-elataGreen/10 rounded-lg p-3">
									<IoCheckmarkCircle className="w-5 h-5 mr-3 flex-shrink-0" />
									<span className="text-sm font-medium">Encryption key verified - Your GPG key matches the study requirements</span>
								</div>
							) : (
								<div className="mt-6 text-gray3 text-sm bg-gray1/20 rounded-lg p-3">
									<strong>This happens automatically</strong> once you connect your wallet and enter a valid study address.
								</div>
							)}
						</div>
					</div>

					{/* Step 5: Data Upload */}
					<div className="p-6 sm:p-10 border-b border-gray2/20">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-6 sm:space-y-0">
							<div className="flex items-start space-x-4 sm:space-x-6">
								<div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 flex-shrink-0 ${
									stepStatus[5] ? 'bg-elataGreen text-white shadow-lg' : 'bg-elataGreen/10 text-elataGreen'
								}`}>
									<span className="text-base sm:text-lg font-bold">5</span>
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-2">
										Upload Your Data
									</h3>
									<p className="text-gray3 font-sf-pro text-base sm:text-lg mb-4 leading-relaxed">
										Choose the data file you want to submit to the study
									</p>
									<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
										<p className="text-elataGreen font-sf-pro text-sm leading-relaxed">
											<strong>Your privacy protected:</strong> Your file is encrypted on your device before being uploaded. 
											The raw data never leaves your computer unencrypted - only the researcher can decrypt it with their private key.
										</p>
									</div>
								</div>
							</div>
							<button
								onClick={() => setActiveModal('data')}
								className="flex items-center text-elataGreen hover:text-offBlack transition-colors duration-200 self-start sm:self-auto"
							>
								<IoHelpCircle className="w-5 h-5 mr-1" />
								<span className="text-sm font-medium">Need help?</span>
							</button>
						</div>
						
						<div className="bg-gray1/10 rounded-xl p-6">
							<EncryptedMessageFromInputFile
								labelText=''
								setState={setEncryptedMessage}
								gpgKey={gpgKey}
								encryptionKey={encryptionKey}
							/>
							{stepStatus[5] ? (
								<div className="mt-6 flex items-center text-elataGreen bg-elataGreen/10 rounded-lg p-3">
									<IoCheckmarkCircle className="w-5 h-5 mr-3 flex-shrink-0" />
									<span className="text-sm font-medium">Data encrypted successfully - Your file is now secure and ready for upload</span>
								</div>
							) : (
								<div className="mt-6 text-gray3 text-sm bg-gray1/20 rounded-lg p-3">
									<strong>File types:</strong> Any research data file (CSV, JSON, TXT, etc.). The researcher will specify what type of data they need.
								</div>
							)}
						</div>
					</div>

					{/* Step 6: Upload to Irys */}
					<div className="p-6 sm:p-10">
						<div className="flex items-start space-x-4 sm:space-x-6 mb-6 sm:mb-8">
							<div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 flex-shrink-0 ${
								stepStatus[6] ? 'bg-elataGreen text-white shadow-lg' : 'bg-elataGreen/10 text-elataGreen'
							}`}>
								<span className="text-base sm:text-lg font-bold">6</span>
							</div>
							<div className="min-w-0 flex-1">
								<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-2">
									Upload to Irys Network
								</h3>
								<p className="text-gray3 font-sf-pro text-base sm:text-lg mb-4 leading-relaxed">
									Store your encrypted data permanently on the decentralized network
								</p>
								<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
									<p className="text-elataGreen font-sf-pro text-sm leading-relaxed">
										<strong>Final step:</strong> Your encrypted data is uploaded to Irys, a permanent decentralized storage network. 
										You will receive a unique ID that proves your data was submitted and when.
									</p>
								</div>
							</div>
						</div>
						
						<div className="bg-gray1/10 rounded-xl p-6">
							<IrysUploadFileEncryptedMessage
								labelText=''
								setState={setIrysUploadData}
								encryptedMessage={encryptedMessage}
								irysBalance={irysBalance}
							/>
							{stepStatus[6] ? (
								<div className="mt-6 flex items-center text-elataGreen bg-elataGreen/10 rounded-lg p-3">
									<IoCheckmarkCircle className="w-5 h-5 mr-3 flex-shrink-0" />
									<span className="text-sm font-medium">Data uploaded successfully - Your encrypted data is now stored permanently</span>
								</div>
							) : (
								<div className="mt-6 text-gray3 text-sm bg-gray1/20 rounded-lg p-3">
									<strong>What happens:</strong> Your encrypted data gets uploaded and you receive a permanent storage receipt.
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Status Message */}
				<div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-white rounded-2xl border border-gray2/20 shadow-lg">
					<div className="flex items-start">
						<div className="flex items-center justify-center w-8 h-8 bg-elataGreen/10 rounded-full mr-4 mt-1 flex-shrink-0">
							<IoInformationCircle className="w-5 h-5 text-elataGreen" />
						</div>
						<div className="min-w-0 flex-1">
							<h4 className="text-base font-semibold font-montserrat text-offBlack mb-2">Current Status</h4>
							<span className="text-gray3 font-sf-pro leading-relaxed text-sm sm:text-base break-words">{message}</span>
						</div>
					</div>
				</div>

				{/* Final Submit Section */}
				<div className="mt-8 sm:mt-12 bg-white rounded-2xl border border-gray2/20 shadow-lg p-6 sm:p-10">
					<div className="text-center mb-8">
						<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-4">
							Ready to Submit Your Data?
						</h3>
						<p className="text-gray3 font-sf-pro text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
							Once you click submit, your encrypted data will be officially recorded on the blockchain and sent to the research study. 
							You will receive ETH rewards according to the study terms.
						</p>
					</div>

					<div className="flex flex-col items-center">
						<button
							onClick={handleZorpStudySubmitData}
							disabled={!allStepsComplete || !isConnected || isPending}
							className={`w-full sm:w-auto inline-flex items-center justify-center px-10 sm:px-16 py-4 sm:py-5 rounded-xl sm:rounded-none shadow-lg font-sf-pro font-medium text-base sm:text-lg transition-all duration-300 ${
								allStepsComplete && isConnected && !isPending
									? 'bg-elataGreen text-white hover:bg-elataGreen/90 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1'
									: 'bg-gray2 text-gray3 cursor-not-allowed'
							}`}
						>
							{isPending ? (
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
							) : (
								<IoSend className="w-6 h-6 mr-4" />
							)}
							{isPending ? 'Submitting to Blockchain...' : 'Submit Data to Study'}
							{!isPending && <IoArrowForward className="w-6 h-6 ml-4" />}
						</button>
						
						{!allStepsComplete && (
							<div className="mt-6 text-center">
								<p className="text-sm text-gray3 font-sf-pro max-w-md px-4 mb-3">
									Please complete all 6 steps above to submit your data
								</p>
								<div className="flex items-center justify-center text-xs text-gray2 bg-gray1/20 rounded-xl sm:rounded-none px-4 py-2">
									<span>Completed: {Object.values(stepStatus).filter(Boolean).length}/6 steps</span>
								</div>
							</div>
						)}

						{allStepsComplete && isConnected && !isPending && (
							<div className="mt-6 bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4 max-w-lg">
								<p className="text-elataGreen font-sf-pro text-sm text-center">
									✅ All steps completed! Your data is encrypted and ready for secure submission to the blockchain.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Help Modals */}
			<HelpModal
				isOpen={activeModal === 'pgp'}
				onClose={() => setActiveModal(null)}
				title="Study GPG Key"
				content={helpContent.pgp}
			/>
			
			<HelpModal
				isOpen={activeModal === 'study'}
				onClose={() => setActiveModal(null)}
				title="Study Address"
				content={helpContent.study}
			/>
			
			<HelpModal
				isOpen={activeModal === 'data'}
				onClose={() => setActiveModal(null)}
				title="Data Submission"
				content={helpContent.data}
			/>
		</div>
	);
}
