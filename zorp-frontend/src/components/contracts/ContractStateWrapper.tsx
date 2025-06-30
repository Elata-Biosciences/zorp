'use client';

import { ReactNode } from 'react';
import { useZorpContract } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import { IoWarning, IoCheckmarkCircle, IoTime, IoWifi } from 'react-icons/io5';

interface ContractStateWrapperProps {
  contractName: 'IZorpFactory' | 'IZorpStudy';
  title: string;
  children: ReactNode;
  requiresWallet?: boolean;
}

export default function ContractStateWrapper({ 
  contractName, 
  title, 
  children, 
  requiresWallet = true 
}: ContractStateWrapperProps) {
  const { isLoading, error, isReady, chainName, chainId } = useZorpContract(contractName);

  // Loading State
  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <div className="animate-spin text-blue-600 dark:text-blue-400 mb-4">
            <IoTime className="w-12 h-12 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Loading contract data...
          </p>
          <div className="text-sm text-gray-500">
            {chainName && chainId && (
              <span>Connected to {chainName} ({chainId})</span>
            )}
          </div>
        </div>
        <div className="fixed bottom-6 right-6">
          <ThemeSwitch />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-2xl">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <IoWarning className="w-12 h-12 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Contract Loading Error
            </h3>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error}
            </p>
            <div className="text-sm text-red-600 dark:text-red-400">
              {chainName && chainId && (
                <p>Current network: {chainName} ({chainId})</p>
              )}
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>💡 <strong>Try these solutions:</strong></p>
            <ul className="text-left space-y-1 max-w-md mx-auto">
              <li>• Switch to Sepolia testnet in your wallet</li>
              <li>• Connect your wallet if not connected</li>
              <li>• Refresh the page and try again</li>
            </ul>
          </div>
        </div>
        <div className="fixed bottom-6 right-6">
          <ThemeSwitch />
        </div>
      </div>
    );
  }

  // Not Ready (no wallet when required)
  if (!isReady && requiresWallet) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <div className="text-blue-600 dark:text-blue-400 mb-4">
            <IoWifi className="w-12 h-12 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your wallet to interact with smart contracts.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-2">💡 Getting Started:</p>
              <ul className="text-left space-y-1">
                <li>• Click &quot;Connect Wallet&quot; in the top-right corner</li>
                <li>• Switch to Sepolia testnet</li>
                <li>• Make sure you have some test ETH</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="fixed bottom-6 right-6">
          <ThemeSwitch />
        </div>
      </div>
    );
  }

  // Success State - render children
  return (
    <div className="w-full">
      {/* Optional success indicator */}
      {isReady && (
        <div className="mb-4 flex items-center justify-center">
          <div className="flex items-center text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
            <IoCheckmarkCircle className="w-4 h-4 mr-1" />
            Connected to {chainName} ({chainId})
          </div>
        </div>
      )}
      {children}
    </div>
  );
} 