'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/lib/constants/navigation';
import { NavigationProps } from '@/lib/types/layout';

export default function Sidebar({ isOpen, toggleOpen }: NavigationProps) {
  const pathname = usePathname();

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    }
    // Auto cleanup when closed/unmounted
  }, [isOpen]);

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-offBlack/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleOpen}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Sidebar */}
      <aside
        className={`z-50 fixed top-0 right-0 w-full h-screen transition-transform overflow-y-auto md:hidden
            ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'} 
            duration-300 bg-white/95 backdrop-blur-md border-l border-gray2/30`}
        style={{ 
          position: 'fixed',
          top: '4rem', // Account for header height (h-16 = 4rem)
          right: 0,
          height: 'calc(100vh - 4rem)',
          width: '100%'
        }}
              >
          <div className="relative h-full p-4 pt-6 flex flex-col overflow-y-auto">
          <ul className="space-y-3 font-sf-pro">
            {navigation.filter(item => item.name !== 'GitHub').map((item, index) => (
              <li key={item.name} className={`animate-staggerFadeIn stagger-${index + 1}`}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-6 py-4 rounded-full font-medium
                    transition-all duration-200 group
                    ${
                      pathname === item.href
                        ? 'bg-elataGreen text-white shadow-lg'
                        : 'hover:bg-elataGreen/10 hover:shadow-md text-offBlack hover:text-elataGreen'
                    }
                  `}
                  onClick={toggleOpen}
                >
                  <item.icon
                    className={`w-6 h-6 transition-all duration-200 ${
                      pathname === item.href 
                        ? 'text-white' 
                        : 'text-offBlack group-hover:text-elataGreen group-hover:scale-110'
                    }`}
                  />
                  <span className="ml-3 font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* GitHub Link */}
          <div className="mt-8 pt-6 border-t border-gray2/30">
            <a
              href="https://github.com/Elata-Biosciences/zorp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 text-offBlack hover:text-elataGreen hover:bg-elataGreen/10 rounded-full transition-all duration-200 group"
              onClick={toggleOpen}
            >
              <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="font-medium">View on GitHub</span>
            </a>
          </div>

          {/* Simple branding at bottom */}
          <div className="mt-4 pt-4 border-t border-gray2/30 text-center">
            <div className="text-sm text-offBlack font-sf-pro">
              Powered by{' '}
              <a 
                href="https://elata.bio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-elataGreen hover:text-offBlack transition-colors font-medium"
              >
                Elata Biosciences
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
