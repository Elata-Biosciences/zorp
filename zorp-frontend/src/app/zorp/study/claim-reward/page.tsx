'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useZorpContract } from '@/contexts/Contracts';
import ZorpStudyAddressInput from '@/components/contracts/ZorpStudyAddressInput';
import * as config from '@/lib/constants/wagmiConfig';
import { 
	IoWallet, 
	IoCheckmarkCircle,
	IoInformationCircle,
	IoWarning,
	IoTime,
	IoClose,
	IoHelpCircle,
	IoCash,
	IoShieldCheckmark,
	IoArrowForward
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
				<div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-auto">
					<div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray2/20">
						<h3 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack pr-4">{title}</h3>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray1/20 rounded-full transition-colors duration-200 flex-shrink-0"
						>
							<IoClose className="w-5 h-5" />
						</button>
					</div>
					<div className="p-6 sm:p-8 overflow-y-auto flex-1">
						{content}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ZorpStudyWriteClaimReward() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('No transactions yet');
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [statusMessage, setStatusMessage] = useState<string>('Connect your wallet and enter a study address to check your rewards');

	const { abi, address: defaultAddress } = useZorpContract('IZorpStudy');
	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const assertsClient = useMemo(() => {
		return {
			isAddressParticipantSet: address?.length === addressStudyAnvil.length && address.startsWith('0x'),
			isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
			isContractStudySet: abi.length > 0 && addressStudy.length > 0,
		};
	}, [
		abi,
		address,
		addressStudy,
		addressStudyAnvil,
	]);

	const { data: participant_status, isFetching: isFetchingParticipantStatus } = useReadContract<
		typeof abi,
		'participant_status',
		[`0x${string}`],
		typeof config.wagmiConfig,
		bigint | 0 | 1 | 2 | 3
	>({
		abi,
		address: addressStudy,
		functionName: 'participant_status',
		args: [address],
		query: {
			enabled: isConnected
						&& assertsClient.isAddressParticipantSet
						&& assertsClient.isAddressStudySet
						&& assertsClient.isContractStudySet
		},
	});

	const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract<
		typeof abi,
		'study_status',
		[`0x${string}`],
		typeof config.wagmiConfig,
		bigint | 0 | 1 | 2
	>({
		abi,
		address: addressStudy,
		functionName: 'study_status',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet && assertsClient.isContractStudySet,
		},
	});

	const assertsBlockchain = useMemo(() => {
		return {
			isParticipantSubmitted: participant_status == 1,
			isStudyFinised: study_status == 2,
		};
	}, [
		participant_status,
		study_status,
	]);

	const disabled = isFetching
								|| isFetchingParticipantStatus 
								|| isFetchingStudyStatus
								|| !isConnected;

	const enabled = isConnected
								&& assertsClient.isAddressParticipantSet
								&& assertsClient.isAddressStudySet
								&& assertsClient.isContractStudySet
								&& assertsBlockchain.isParticipantSubmitted
								&& assertsBlockchain.isStudyFinised;

	// Update status message based on current state
	useEffect(() => {
		if (!isConnected) {
			setStatusMessage('Please connect your wallet to check for rewards');
		} else if (!assertsClient.isAddressStudySet) {
			setStatusMessage('Enter a study address to check your participation status');
		} else if (isFetchingParticipantStatus || isFetchingStudyStatus) {
			setStatusMessage('Checking your participation status and study completion...');
		} else if (enabled) {
			setStatusMessage('🎉 Congratulations! You have a reward ready to claim');
		} else if (participant_status === 2) {
			setStatusMessage('You have already claimed your reward for this study');
		} else if (participant_status === 3) {
			setStatusMessage('Your submission was marked as invalid and is not eligible for rewards');
		} else if (participant_status === 0) {
			setStatusMessage('You have not submitted data to this study');
		} else if (study_status !== 2) {
			setStatusMessage('This study has not finished yet. Rewards will be available once the study is completed');
		} else {
			setStatusMessage('Reward status could not be determined. Please verify your participation');
		}
	}, [
		isConnected,
		assertsClient.isAddressStudySet,
		isFetchingParticipantStatus,
		isFetchingStudyStatus,
		enabled,
		participant_status,
		study_status
	]);

	const handleZorpStudyWriteClaimReward = useCallback(async () => {
		if (!enabled) {
			console.warn('Missing required state', { assertsClient, assertsBlockchain });
			return;
		}

		setIsFetching(true);
		setStatusMessage('Processing your reward claim on the blockchain...');

		try {
			const response = await writeContractAsync({
				abi,
				address: addressStudy,
				functionName: 'claimReward',
				args: [],
			});

			if (!!response) {
				setReceipt(response);
				setStatusMessage('Reward claimed successfully! Transaction hash: ' + response);
			} else {
				setReceipt(`Error with transaction response`);
				setStatusMessage('Error occurred while claiming reward. Please try again.');
			}
		} catch (error) {
			let message = 'Error claiming reward: ';
			if (!!error && typeof error == 'object') {
				if ('message' in error) {
					message += error.message;
				} else if ('toString' in error) {
					message += error.toString();
				} else {
					message += `Unknown error occurred`;
				}
			} else {
				message += `Unknown error occurred`;
			}

			console.error('ZorpStudyWriteClaimReward ...', { message, error });
			setReceipt(message);
			setStatusMessage(message);
			return error;
		} finally {
			setIsFetching(false);
		}
	}, [
		abi,
		addressStudy,
		assertsBlockchain,
		assertsClient,
		enabled,
		setIsFetching,
		writeContractAsync,
	]);

	const getStatusText = (status: bigint | 0 | 1 | 2 | 3 | undefined) => {
		switch (status) {
			case 0: return 'Not submitted';
			case 1: return 'Submitted';
			case 2: return 'Paid';
			case 3: return 'Invalid';
			default: return 'Unknown';
		}
	};

	const getStudyStatusText = (status: bigint | 0 | 1 | 2 | undefined) => {
		switch (status) {
			case 0: return 'Not active';
			case 1: return 'Active';
			case 2: return 'Finished';
			default: return 'Unknown';
		}
	};

	const getStatusIcon = (status: bigint | 0 | 1 | 2 | 3 | undefined) => {
		switch (status) {
			case 1: return <IoCheckmarkCircle className="w-5 h-5 text-elataGreen" />;
			case 2: return <IoCash className="w-5 h-5 text-elataGreen" />;
			case 3: return <IoWarning className="w-5 h-5 text-accentRed" />;
			default: return <IoTime className="w-5 h-5 text-gray3" />;
		}
	};

	const getStudyStatusIcon = (status: bigint | 0 | 1 | 2 | undefined) => {
		switch (status) {
			case 1: return <IoTime className="w-5 h-5 text-elataGreen" />;
			case 2: return <IoCheckmarkCircle className="w-5 h-5 text-elataGreen" />;
			default: return <IoClose className="w-5 h-5 text-gray3" />;
		}
	};

	// Help modal content
	const helpContent = {
		rewards: (
			<div className="space-y-4">
				<p className="text-gray3 font-sf-pro leading-relaxed">
					Rewards are ETH payments distributed to participants who successfully submitted valid data to completed research studies.
				</p>
				<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
					<h4 className="font-semibold font-montserrat text-offBlack mb-2">How Rewards Work:</h4>
					<ul className="space-y-1 text-gray3 font-sf-pro text-sm">
						<li>• You must have submitted data to the study</li>
						<li>• The study must be marked as finished by the researcher</li>
						<li>• Your submission must be validated as legitimate</li>
						<li>• Rewards are split equally among all valid participants</li>
					</ul>
				</div>
				<div className="space-y-2">
					<h4 className="font-semibold font-montserrat text-offBlack">Reward Status:</h4>
					<div className="space-y-2 text-gray3 font-sf-pro text-sm">
						<div className="flex items-center"><IoCheckmarkCircle className="w-4 h-4 text-elataGreen mr-2" /><strong>Submitted:</strong> Ready to claim when study finishes</div>
						<div className="flex items-center"><IoCash className="w-4 h-4 text-elataGreen mr-2" /><strong>Paid:</strong> Reward already claimed</div>
						<div className="flex items-center"><IoWarning className="w-4 h-4 text-accentRed mr-2" /><strong>Invalid:</strong> Not eligible for rewards</div>
					</div>
				</div>
			</div>
		),
		study: (
			<div className="space-y-4">
				<p className="text-gray3 font-sf-pro leading-relaxed">
					Each research study has a unique blockchain address where participants submit data and claim rewards.
				</p>
				<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
					<h4 className="font-semibold font-montserrat text-offBlack mb-2">Study Phases:</h4>
					<ul className="space-y-1 text-gray3 font-sf-pro text-sm">
						<li>• <strong>Active:</strong> Accepting data submissions</li>
						<li>• <strong>Finished:</strong> Closed to submissions, rewards available</li>
						<li>• <strong>Not Active:</strong> Study not yet started</li>
					</ul>
				</div>
				<p className="text-gray3 font-sf-pro text-sm">
					<strong>Note:</strong> You can only claim rewards after a study is marked as finished.
				</p>
			</div>
		)
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-cream1 via-offCream to-cream2">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
				{/* Header */}
				<div className="text-center mb-10 sm:mb-16">
					<div className="inline-flex items-center justify-center w-14 h-14 sm:w-18 sm:h-18 bg-elataGreen/10 rounded-2xl mb-6 sm:mb-8">
						<IoCash className="w-7 h-7 sm:w-9 sm:h-9 text-elataGreen" />
					</div>
					<h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-montserrat text-offBlack mb-4 sm:mb-6 px-2">
						Claim Study Rewards
					</h1>
					<p className="text-lg sm:text-xl text-gray3 font-sf-pro max-w-2xl mx-auto leading-relaxed px-4 mb-8">
						Claim your ETH rewards for participating in completed research studies with validated data submissions.
					</p>
					
					{/* Process Overview */}
					<div className="bg-elataGreen/5 border border-elataGreen/20 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
						<div className="flex items-start">
							<IoInformationCircle className="w-6 h-6 text-elataGreen mt-1 mr-4 flex-shrink-0" />
							<div className="text-left">
								<h3 className="font-semibold font-montserrat text-offBlack mb-3">How Rewards Work</h3>
								<p className="text-gray3 font-sf-pro text-sm sm:text-base leading-relaxed">
									Researchers deposit ETH when creating studies. When studies are completed, the reward pool is automatically 
									distributed equally among all participants with validated data submissions.
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="bg-white rounded-2xl shadow-xl border border-gray2/20 overflow-hidden">
					
					{/* Study Address Section */}
					<div className="p-6 sm:p-10 border-b border-gray2/20">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
							<div className="flex items-start space-x-4 sm:space-x-6">
								<div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-elataGreen/10 rounded-2xl flex-shrink-0">
									<IoShieldCheckmark className="w-6 h-6 text-elataGreen" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-2">
										Enter Study Address
									</h3>
									<p className="text-gray3 font-sf-pro text-base sm:text-lg mb-4 leading-relaxed">
										Provide the blockchain address of the study you participated in
									</p>
									<div className="bg-elataGreen/10 border border-elataGreen/20 rounded-xl p-4">
										<p className="text-elataGreen font-sf-pro text-sm leading-relaxed">
											<strong>Important:</strong> This should be the same study address where you originally submitted your data. 
											You can find this in your submission confirmation or from the researcher.
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
								disabled={isFetching}
								setState={setAddressStudy}
							/>
						</div>
					</div>

					{/* Status Information */}
					<div className="p-6 sm:p-10 border-b border-gray2/20">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
							<div className="flex items-start space-x-4 sm:space-x-6">
								<div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-elataGreen/10 rounded-2xl flex-shrink-0">
									<IoInformationCircle className="w-6 h-6 text-elataGreen" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-2">
										Check Reward Status
									</h3>
									<p className="text-gray3 font-sf-pro text-base sm:text-lg mb-4 leading-relaxed">
										Review your participation status and study completion status
									</p>
								</div>
							</div>
							<button
								onClick={() => setActiveModal('rewards')}
								className="flex items-center text-elataGreen hover:text-offBlack transition-colors duration-200 self-start sm:self-auto"
							>
								<IoHelpCircle className="w-5 h-5 mr-1" />
								<span className="text-sm font-medium">Need help?</span>
							</button>
						</div>

						<div className="grid md:grid-cols-2 gap-6">
							<div className="bg-gray1/10 rounded-xl p-6">
								<div className="flex items-center justify-between mb-4">
									<h4 className="font-semibold font-montserrat text-offBlack">Your Status</h4>
									{getStatusIcon(participant_status)}
								</div>
								<div className="text-base">
									{isFetchingParticipantStatus ? (
										<div className="flex items-center text-gray3">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-elataGreen mr-2"></div>
											Loading...
										</div>
									) : (
										<span className={`font-medium ${
											participant_status === 1 || participant_status === 2 ? 'text-elataGreen' : 
											participant_status === 3 ? 'text-accentRed' : 'text-gray3'
										}`}>
											{getStatusText(participant_status)}
										</span>
									)}
								</div>
								<p className="text-sm text-gray3 mt-2">
									{participant_status === 1 && 'You submitted data and are eligible for rewards'}
									{participant_status === 2 && 'You have already claimed your reward'}
									{participant_status === 3 && 'Your submission was marked as invalid'}
									{participant_status === 0 && 'No data submission found for this study'}
									{participant_status === undefined && 'Connect wallet and enter study address'}
								</p>
							</div>

							<div className="bg-gray1/10 rounded-xl p-6">
								<div className="flex items-center justify-between mb-4">
									<h4 className="font-semibold font-montserrat text-offBlack">Study Status</h4>
									{getStudyStatusIcon(study_status)}
								</div>
								<div className="text-base">
									{isFetchingStudyStatus ? (
										<div className="flex items-center text-gray3">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-elataGreen mr-2"></div>
											Loading...
										</div>
									) : (
										<span className={`font-medium ${
											study_status === 2 ? 'text-elataGreen' : 
											study_status === 1 ? 'text-orange-500' : 'text-gray3'
										}`}>
											{getStudyStatusText(study_status)}
										</span>
									)}
								</div>
								<p className="text-sm text-gray3 mt-2">
									{study_status === 2 && 'Study is complete, rewards are available'}
									{study_status === 1 && 'Study is still active, wait for completion'}
									{study_status === 0 && 'Study has not started yet'}
									{study_status === undefined && 'Enter study address to check status'}
								</p>
							</div>
						</div>
					</div>

					{/* Transaction Receipt */}
					{receipt !== 'No transactions yet' && (
						<div className="p-6 sm:p-10">
							<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-6">
								Transaction Details
							</h3>
							<div className="bg-gray1/10 rounded-xl p-6">
								<div className="flex items-start">
									<IoInformationCircle className="w-5 h-5 text-elataGreen mt-1 mr-3 flex-shrink-0" />
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium font-montserrat text-offBlack mb-2">Transaction Hash:</p>
										<div className="font-mono text-sm break-all text-gray3 bg-white rounded-lg p-3 border border-gray2/20">
											{receipt}
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Status Message */}
				<div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-white rounded-2xl border border-gray2/20 shadow-lg">
					<div className="flex items-start">
						<div className="flex items-center justify-center w-8 h-8 bg-elataGreen/10 rounded-full mr-4 mt-1 flex-shrink-0">
							<IoInformationCircle className="w-5 h-5 text-elataGreen" />
						</div>
						<div className="min-w-0 flex-1">
							<h4 className="text-base font-semibold font-montserrat text-offBlack mb-2">Current Status</h4>
							<span className="text-gray3 font-sf-pro leading-relaxed text-sm sm:text-base break-words">{statusMessage}</span>
						</div>
					</div>
				</div>

				{/* Claim Reward Button */}
				<div className="mt-8 sm:mt-12 bg-white rounded-2xl border border-gray2/20 shadow-lg p-6 sm:p-10">
					<div className="text-center mb-8">
						<h3 className="text-xl sm:text-2xl font-semibold font-montserrat text-offBlack mb-4">
							Ready to Claim Your Reward?
						</h3>
						<p className="text-gray3 font-sf-pro text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
							{enabled 
								? 'Your reward is ready! Click below to claim your ETH payment for participating in this research study.'
								: 'Complete the requirements above to claim your reward. You must have submitted valid data to a finished study.'
							}
						</p>
					</div>

					<div className="flex flex-col items-center">
						<button
							onClick={async (event) => {
								event.preventDefault();
								event.stopPropagation();
								await handleZorpStudyWriteClaimReward();
							}}
							disabled={disabled || !enabled}
							className={`w-full sm:w-auto inline-flex items-center justify-center px-10 sm:px-16 py-4 sm:py-5 rounded-xl sm:rounded-none shadow-lg font-sf-pro font-medium text-base sm:text-lg transition-all duration-300 ${
								enabled && !isFetching
									? 'bg-elataGreen text-white hover:bg-elataGreen/90 hover:shadow-xl transform hover:scale-105 hover:-translate-y-1'
									: 'bg-gray2 text-gray3 cursor-not-allowed'
							}`}
						>
							{isFetching ? (
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
							) : enabled ? (
								<IoCash className="w-6 h-6 mr-4" />
							) : (
								<IoTime className="w-6 h-6 mr-4" />
							)}
							{isFetching ? 'Claiming Reward...' : enabled ? 'Claim Reward' : 'Reward Not Available'}
							{!isFetching && enabled && <IoArrowForward className="w-6 h-6 ml-4" />}
						</button>
						
						{!enabled && (
							<p className="mt-6 text-sm text-gray3 font-sf-pro text-center max-w-md px-4">
								{!isConnected 
									? 'Please connect your wallet to check for available rewards'
									: 'Complete the requirements above to claim your reward'
								}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Help Modals */}
			<HelpModal
				isOpen={activeModal === 'rewards'}
				onClose={() => setActiveModal(null)}
				title="Understanding Rewards"
				content={helpContent.rewards}
			/>
			
			<HelpModal
				isOpen={activeModal === 'study'}
				onClose={() => setActiveModal(null)}
				title="Study Address"
				content={helpContent.study}
			/>
		</div>
	);
}
