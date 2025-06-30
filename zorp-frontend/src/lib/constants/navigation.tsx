import { FaXTwitter } from 'react-icons/fa6';
import { IoLogoGithub, IoFlask, IoPlanet, IoShieldCheckmark } from 'react-icons/io5';

// Navbar links
export const navLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/Elata-Biosciences/zorp',
  },
];

// Footer social links
export const socialLinks = [
  {
    href: 'https://github.com/Elata-Biosciences/zorp',
    icon: <IoLogoGithub className="w-5 h-5" />,
    label: 'Github',
    hoverColor: 'hover:text-black hover:dark:text-black',
  },
  {
    href: 'https://discord.com/invite/UxSQnZnPus',
    icon: <IoShieldCheckmark className="w-5 h-5" />,
    label: 'Discord',
    hoverColor: 'hover:text-blue-600 hover:dark:text-blue-600',
  },
  {
    href: 'https://elata.bio',
    icon: <IoPlanet className="w-5 h-5" />,
    label: 'Elata Biosciences',
    hoverColor: 'hover:text-green-500 hover:dark:text-green-500',
  },
];

// Navigation items for the main navigation
export const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: IoPlanet,
  },
  {
    name: 'Create Study',
    href: '/zorp/factory/create-study',
    icon: IoFlask,
  },
  {
    name: 'Submit Data',
    href: '/zorp/study/submit-data',
    icon: IoShieldCheckmark,
  },
  {
    name: 'Browse Studies',
    href: '/zorp/factory/studies',
    icon: IoFlask,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/Elata-Biosciences/zorp',
    icon: IoLogoGithub,
  },
];
