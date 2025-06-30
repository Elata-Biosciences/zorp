'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  IoLogoGithub, 
  IoShieldCheckmark, 
  IoPlanet,
  IoDocumentText,
  IoFlask,
  IoWallet,
  IoPeople,
  IoMail,
  IoLogoTwitter,
  IoInformationCircle,
  IoGlobe
} from 'react-icons/io5';

export default function Footer() {
  const footerSections = [
    {
      title: "Research",
      links: [
        { label: "Create Study", href: "/zorp/factory/create-study", icon: IoFlask },
        { label: "Browse Studies", href: "/zorp/factory/studies", icon: IoDocumentText },
        { label: "Study Status", href: "/zorp/study/study-status", icon: IoShieldCheckmark },
        { label: "Submit Data", href: "/zorp/study/submit-data", icon: IoPeople },
      ]
    },
    {
      title: "Platform",
      links: [
        { label: "Claim Rewards", href: "/zorp/study/claim-reward", icon: IoWallet },
        { label: "GitHub", href: "https://github.com/Elata-Biosciences/zorp", icon: IoLogoGithub },
        { label: "About ZORP", href: "/#about", icon: IoShieldCheckmark },
      ]
    },
    {
      title: "Elata",
      links: [
        { label: "Elata Biosciences", href: "https://elata.bio", icon: IoPlanet },
        { label: "Research", href: "https://elata.bio/research", icon: IoFlask },
        { label: "Technology", href: "https://elata.bio/technology", icon: IoShieldCheckmark },
        { label: "Community", href: "https://discord.com/invite/UxSQnZnPus", icon: IoPeople },
      ]
    }
  ];

  const socialLinks = [
    {
      href: 'https://github.com/Elata-Biosciences/zorp',
      icon: <IoLogoGithub className="w-5 h-5" />,
      label: 'GitHub',
    },
    {
      href: 'https://discord.com/invite/UxSQnZnPus',
      icon: <IoShieldCheckmark className="w-5 h-5" />,
      label: 'Discord',
    },
    {
      href: 'https://elata.bio',
      icon: <IoPlanet className="w-5 h-5" />,
      label: 'Elata Biosciences',
    },
  ];

  return (
    <footer className="bg-cream2/60 backdrop-blur-sm border-t border-gray2/20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/img/logotype.png"
                alt="ZORP Logotype"
                width={100}
                height={32}
                className="transition-all duration-300 hover:opacity-80"
              />
            </div>
            <p className="text-gray3 font-sf-pro text-sm leading-relaxed mb-6">
              Privacy-preserving data collection and reward distribution platform for decentralized research studies.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex justify-center p-2 text-gray3 rounded-lg cursor-pointer transition-all duration-200 hover:text-elataGreen hover:bg-white/60 hover:shadow-md hover:scale-105"
                  aria-label={label}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-montserrat font-semibold text-offBlack mb-4 text-base">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="group flex items-center text-gray3 font-sf-pro text-sm transition-all duration-200 hover:text-elataGreen"
                    >
                      <link.icon className="w-4 h-4 mr-2 opacity-60 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray2/30 py-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
          <p className="text-sm text-gray3 font-sf-pro text-left">
            © 2025 Elata Biosciences. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
