'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { NavigationProps } from '@/lib/types/layout';

export default function NavBar({ isOpen, toggleOpen }: NavigationProps) {
  return (
    <header className="px-6 md:px-8 bg-offCream/95 backdrop-blur-md border-b border-gray2/20 shadow-sm sticky top-0 z-50">
      <nav className="flex items-center justify-between mx-auto max-w-7xl h-16">
        {/* Logo with ZORP branding */}
        <Link href="/" className="flex items-center space-x-3 group">
          <Image
            src="/img/logotype.png"
            alt="ZORP Logotype"
            width={120}
            height={40}
            priority
            className="transition-all duration-300 group-hover:opacity-80 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <a
            href="https://github.com/Elata-Biosciences/zorp"
            target="_blank"
            rel="noreferrer"
            className="text-gray3 hover:text-offBlack transition-all duration-200 p-2 rounded-lg hover:bg-gray1/20 mr-6"
            title="View on GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          
          <div className="border-l border-gray2/30 pl-6">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="px-6 py-2 bg-offBlack text-white font-sf-pro font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-gray3 transform hover:scale-105 transition-all duration-300"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="px-6 py-2 bg-accentRed text-white font-sf-pro font-medium rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                          >
                            Wrong network
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="px-4 py-2 bg-white border border-gray2 text-offBlack font-sf-pro font-medium rounded-full hover:bg-gray1/20 transition-all duration-300"
                        >
                          {account.displayName}
                        </button>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center md:hidden space-x-4">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="px-4 py-2 bg-offBlack text-white font-sf-pro font-medium text-sm rounded-full shadow-lg hover:shadow-xl hover:bg-gray3 transform hover:scale-105 transition-all duration-300"
                        >
                          Connect
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="px-4 py-2 bg-accentRed text-white font-sf-pro font-medium text-sm rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          Wrong net
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="px-3 py-2 bg-white border border-gray2 text-offBlack font-sf-pro font-medium text-sm rounded-full hover:bg-gray1/20 transition-all duration-300 max-w-24 truncate"
                      >
                        {account.displayName}
                      </button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
          
          <button
            onClick={() => toggleOpen()}
            className="ml-4 p-2 rounded-lg hover:bg-gray2/20 transition-colors duration-200"
            aria-label="Toggle Menu"
          >
            <div
              className={`hamburger flex flex-col justify-between w-6 h-5 ${isOpen ? 'open' : ''}`}
            >
              <span className="line" />
              <span className="line" />
              <span className="line" />
            </div>
          </button>
        </div>
      </nav>
    </header>
  );
}
