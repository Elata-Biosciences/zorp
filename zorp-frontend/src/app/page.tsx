'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';
import { 
  IoShieldCheckmark, 
  IoDocumentText, 
  IoWallet, 
  IoPeople,
  IoArrowForward,
  IoFlask,
  IoLockClosed,
  IoTrendingUp,
  IoRocket
} from 'react-icons/io5';

export default function Home() {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      console.log('Wallet address: ', address);
    } else {
      console.log('Not connected');
    }
  }, [address, isConnected]);

  const features = [
    {
      icon: <IoShieldCheckmark className="w-8 h-8" />,
      title: "Privacy-Preserving",
      description: "Submit data pseudonymously with GPG encryption and on-chain rewards"
    },
    {
      icon: <IoFlask className="w-8 h-8" />,
      title: "Research Studies",
      description: "Create and manage data collection studies for EEG, surveys, and more"
    },
    {
      icon: <IoWallet className="w-8 h-8" />,
      title: "Reward Distribution",
      description: "Fair ETH payouts distributed automatically to valid participants"
    },
    {
      icon: <IoPeople className="w-8 h-8" />,
      title: "Decentralized",
      description: "Built on Ethereum with transparent, trustless smart contracts"
    }
  ];

  const quickActions = [
    {
      title: "Create Study",
      description: "Launch a new research study with encrypted data collection",
      href: "/zorp/factory/create-study",
      icon: <IoDocumentText className="w-6 h-6" />,
      color: "from-elataGreen/20 to-elataGreen/40",
      iconColor: "bg-elataGreen",
      badge: "Researchers"
    },
    {
      title: "Submit Data",
      description: "Participate in active studies and earn ETH rewards",
      href: "/zorp/study/submit-data",
      icon: <IoTrendingUp className="w-6 h-6" />,
      color: "from-accentRed/20 to-accentRed/40",
      iconColor: "bg-accentRed",
      badge: "Participants"
    },
    {
      title: "Study Status",
      description: "Check if a study is active, finished, or not started",
      href: "/zorp/study/study-status",
      icon: <IoFlask className="w-6 h-6" />,
      color: "from-gray3/20 to-gray3/40",
      iconColor: "bg-gray3",
      badge: "Anyone"
    },
    {
      title: "Claim Rewards",
      description: "Withdraw your earned rewards from completed studies",
      href: "/zorp/study/claim-reward",
      icon: <IoWallet className="w-6 h-6" />,
      color: "from-elataGreen/15 to-accentRed/20",
      iconColor: "bg-gradient-to-r from-elataGreen to-accentRed",
      badge: "Participants"
    }
  ];

  return (
    <div className="w-full bg-offCream">
      {/* Hero Section with Really Cool Animated Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Super Dynamic Modern Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream1 via-offCream to-cream2">
          
          {/* Dramatic moving gradient waves - Green & Cream Theme */}
          <div className="absolute inset-0 opacity-70">
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(45deg, rgba(96, 114, 116, 0.35) 0%, transparent 25%, rgba(96, 114, 116, 0.25) 50%, transparent 75%, rgba(96, 114, 116, 0.15) 100%)',
                animation: 'wave 6s ease-in-out infinite',
                transformOrigin: 'center'
              }}
            ></div>
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(-45deg, rgba(96, 114, 116, 0.2) 0%, transparent 30%, rgba(227, 224, 211, 0.4) 60%, transparent 100%)',
                animation: 'wave 8s ease-in-out infinite reverse',
                transformOrigin: 'center'
              }}
            ></div>
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(243, 238, 226, 0.3) 0%, transparent 35%, rgba(96, 114, 116, 0.18) 70%, transparent 100%)',
                animation: 'wave 10s ease-in-out infinite',
                transformOrigin: 'center'
              }}
            ></div>
          </div>
          
          {/* Large prominent floating orbs - Green & Cream */}
          <div className="absolute inset-0">
            {/* Extra large primary orb - elataGreen */}
            <div 
              className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-50"
              style={{
                top: '5%',
                left: '10%',
                background: 'radial-gradient(circle, rgba(96, 114, 116, 0.6) 0%, rgba(96, 114, 116, 0.3) 40%, rgba(96, 114, 116, 0.1) 70%, transparent 100%)',
                animation: 'floatDramatic 8s ease-in-out infinite'
              }}
            ></div>
            
            {/* Large secondary orb - lighter elataGreen */}
            <div 
              className="absolute w-96 h-96 rounded-full blur-2xl opacity-45"
              style={{
                bottom: '10%',
                right: '15%',
                background: 'radial-gradient(circle, rgba(96, 114, 116, 0.45) 0%, rgba(96, 114, 116, 0.2) 45%, rgba(243, 238, 226, 0.15) 70%, transparent 100%)',
                animation: 'floatDramatic 10s ease-in-out infinite reverse'
              }}
            ></div>
            
            {/* Medium accent orb - cream with green tint */}
            <div 
              className="absolute w-80 h-80 rounded-full blur-xl opacity-35"
              style={{
                top: '50%',
                left: '65%',
                background: 'radial-gradient(circle, rgba(243, 238, 226, 0.5) 0%, rgba(96, 114, 116, 0.15) 50%, transparent 70%)',
                animation: 'floatSmooth 12s ease-in-out infinite'
              }}
            ></div>
            
            {/* Additional dynamic elements - Green variations */}
            <div 
              className="absolute w-64 h-64 rounded-full blur-lg opacity-30"
              style={{
                top: '20%',
                right: '25%',
                background: 'radial-gradient(circle, rgba(96, 114, 116, 0.4) 0%, rgba(96, 114, 116, 0.15) 60%, transparent 100%)',
                animation: 'floatSpin 7s ease-in-out infinite'
              }}
            ></div>
            
            <div 
              className="absolute w-48 h-48 rounded-full blur-xl opacity-25"
              style={{
                bottom: '35%',
                left: '20%',
                background: 'radial-gradient(circle, rgba(227, 224, 211, 0.4) 0%, rgba(96, 114, 116, 0.12) 65%, transparent 100%)',
                animation: 'floatSpin 9s ease-in-out infinite reverse'
              }}
            ></div>
            
            {/* Small accent particles - Subtle green & cream */}
            <div 
              className="absolute w-32 h-32 rounded-full blur-md opacity-20"
              style={{
                top: '15%',
                left: '45%',
                background: 'radial-gradient(circle, rgba(96, 114, 116, 0.3) 0%, transparent 70%)',
                animation: 'floatTiny 5s ease-in-out infinite'
              }}
            ></div>
            
            <div 
              className="absolute w-24 h-24 rounded-full blur-sm opacity-15"
              style={{
                bottom: '60%',
                right: '40%',
                background: 'radial-gradient(circle, rgba(243, 238, 226, 0.35) 0%, transparent 80%)',
                animation: 'floatTiny 6s ease-in-out infinite reverse'
              }}
            ></div>
          </div>
          
          {/* Rotating gradient overlays - Green & Cream theme */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(96, 114, 116, 0.2) 0deg, transparent 120deg, rgba(243, 238, 226, 0.25) 240deg, transparent 360deg)',
              animation: 'rotate 15s linear infinite'
            }}
          ></div>
          
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'conic-gradient(from 180deg at 30% 70%, rgba(96, 114, 116, 0.15) 0deg, transparent 90deg, rgba(227, 224, 211, 0.2) 180deg, transparent 270deg)',
              animation: 'rotate 25s linear infinite reverse'
            }}
          ></div>
          
          {/* Modern mesh gradient overlay - Green & Cream harmony */}
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              background: 'radial-gradient(ellipse at top left, rgba(96, 114, 116, 0.3) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(243, 238, 226, 0.35) 0%, transparent 50%), radial-gradient(ellipse at center, rgba(96, 114, 116, 0.15) 0%, transparent 50%)',
              animation: 'pulse 8s ease-in-out infinite'
            }}
          ></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center px-4 sm:px-6 py-12 sm:py-20">
          {/* Logo Icon */}
          <div className="mb-8 sm:mb-12 flex justify-center animate-fadeInScale">
            <Image
              src="/img/logo.png"
              alt="ZORP Icon"
              width={80}
              height={80}
              className="sm:w-[120px] sm:h-[120px] transition-all duration-500 hover:scale-110 drop-shadow-xl"
            />
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold font-montserrat bg-gradient-to-r from-elataGreen via-offBlack to-elataGreen bg-clip-text text-transparent mb-6 sm:mb-8 animate-fadeInUp">
            ZORP
          </h1>
          
          {/* Subtitle */}
          <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold font-montserrat text-offBlack mb-4 sm:mb-6 animate-fadeInUp stagger-2 px-2">
            Onchain Research Protocol
          </h2>
          
          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl font-sf-pro text-gray3 max-w-4xl mx-auto mb-10 sm:mb-16 leading-relaxed animate-fadeInUp stagger-3 px-2">
            Privacy-preserving data collection and reward distribution platform. 
            Submit research data pseudonymously while earning ETH rewards through 
            transparent, decentralized smart contracts.
          </p>

          {/* CTA Buttons - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center animate-slideInRight stagger-4 px-4">
            <Link 
              href="/zorp/factory/create-study"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-offBlack text-white font-sf-pro font-medium rounded-xl sm:rounded-none shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 btn-focus"
            >
              Create Study
              <IoArrowForward className="ml-2 w-5 h-5" />
            </Link>
            
            <Link 
              href="/zorp/study/submit-data"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-white border-2 border-gray2 text-offBlack font-sf-pro font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-gray1/20 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 btn-focus"
            >
              Submit Data
              <IoArrowForward className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-cream1">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat text-center text-offBlack mb-8 sm:mb-12 animate-fadeInUp px-2">
            Why Choose ZORP?
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`text-center p-4 sm:p-6 rounded-2xl bg-white shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500 border border-gray2/30 animate-staggerFadeIn stagger-${index + 1}`}>
                <div className="text-elataGreen mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray3 font-sf-pro leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions Section - Fixed Elata Colors */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-cream2">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat text-center text-offBlack mb-8 sm:mb-12 animate-fadeInUp px-2">
            Get Started
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={`group relative p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-3 transition-all duration-500 overflow-hidden border border-gray2/30 animate-staggerFadeIn stagger-${index + 1}`}
              >
                {/* Gradient Background using Elata colors */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Badge */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                  <span className={`px-2 sm:px-3 py-1 text-xs font-medium font-sf-pro text-white ${action.iconColor} rounded-full shadow-md`}>
                    {action.badge}
                  </span>
                </div>
                
                {/* Content */}
                <div className="relative">
                  <div className={`text-white ${action.iconColor} w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  
                  <h4 className="text-base sm:text-lg font-semibold font-montserrat text-offBlack mb-2">
                    {action.title}
                  </h4>
                  
                  <p className="text-gray3 font-sf-pro text-sm mb-3 sm:mb-4 leading-relaxed">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center text-elataGreen text-sm font-medium font-sf-pro group-hover:translate-x-2 transition-transform duration-300">
                    Get Started
                    <IoArrowForward className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-montserrat text-offBlack mb-8 sm:mb-12 animate-fadeInUp px-2">
            How It Works
          </h3>
          
          <div className="space-y-8 sm:space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 animate-staggerFadeIn stagger-1">
              <div className="bg-elataGreen/10 border border-elataGreen/20 p-4 sm:p-6 rounded-2xl shadow-lg flex-shrink-0">
                <IoLockClosed className="w-8 h-8 sm:w-10 sm:h-10 text-elataGreen mx-auto" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack mb-2">
                  1. Encrypted Data Submission
                </h4>
                <p className="text-gray3 font-sf-pro leading-relaxed text-sm sm:text-base">
                  Participants encrypt their data using GPG/PGP before submitting to IPFS, ensuring privacy and security.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 animate-staggerFadeIn stagger-2">
              <div className="bg-elataGreen/10 border border-elataGreen/20 p-4 sm:p-6 rounded-2xl shadow-lg flex-shrink-0">
                <IoShieldCheckmark className="w-8 h-8 sm:w-10 sm:h-10 text-elataGreen mx-auto" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack mb-2">
                  2. Smart Contract Validation
                </h4>
                <p className="text-gray3 font-sf-pro leading-relaxed text-sm sm:text-base">
                  Study moderators can validate submissions and flag invalid data through transparent on-chain processes.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 animate-staggerFadeIn stagger-3">
              <div className="bg-elataGreen/10 border border-elataGreen/20 p-4 sm:p-6 rounded-2xl shadow-lg flex-shrink-0">
                <IoWallet className="w-8 h-8 sm:w-10 sm:h-10 text-elataGreen mx-auto" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg sm:text-xl font-semibold font-montserrat text-offBlack mb-2">
                  3. Automatic Reward Distribution
                </h4>
                <p className="text-gray3 font-sf-pro leading-relaxed text-sm sm:text-base">
                  Valid participants receive their fair share of ETH rewards automatically when studies conclude.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Info Section - Square "Start Creating" Button */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-cream1">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-6 sm:p-12 shadow-xl border border-gray2/30 animate-fadeInScale">
            <div className="text-elataGreen mb-4 sm:mb-6">
              <IoRocket className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-montserrat text-offBlack mb-4 sm:mb-6 px-2">
              Join the Future of Research
            </h3>
            <p className="text-lg sm:text-xl text-gray3 font-sf-pro mb-6 sm:mb-8 leading-relaxed px-2">
              Be part of the revolution in decentralized science. ZORP enables transparent, 
              privacy-preserving research with fair compensation for all participants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/zorp/factory/create-study"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-elataGreen text-white font-sf-pro font-medium rounded-xl sm:rounded-none shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
              >
                <IoFlask className="w-5 h-5 mr-2" />
                Start Creating
              </Link>
              <Link
                href="https://github.com/Elata-Biosciences/zorp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-white border border-gray2 text-offBlack font-sf-pro font-medium rounded-full shadow-lg hover:shadow-xl hover:bg-gray1/20 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
              >
                <IoDocumentText className="w-5 h-5 mr-2" />
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
