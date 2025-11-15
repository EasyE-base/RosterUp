import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  Trophy,
  Settings,
  Globe,
  Swords,
  UserCircle,
  Target,
} from 'lucide-react';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { organization, player } = useAuth();
  const [open, setOpen] = useState(false);

  // Organization navigation
  const organizationNavigation = [
    { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Tournaments', href: '/tournaments', icon: <Swords className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Website', href: '/website-builder', icon: <Globe className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Players', href: '/players', icon: <Users className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Calendar', href: '/calendar', icon: <Calendar className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Messages', href: '/messages', icon: <MessageSquare className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
  ];

  // Player navigation
  const playerNavigation = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'My Profile', href: '/player/profile', icon: <UserCircle className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Tryouts', href: '/tryouts', icon: <Target className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Tournaments', href: '/tournaments', icon: <Swords className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'My Teams', href: '/player/teams', icon: <Trophy className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Calendar', href: '/calendar', icon: <Calendar className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Messages', href: '/messages', icon: <MessageSquare className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="text-[rgb(134,142,150)] group-hover/sidebar:text-[rgb(0,113,227)] h-5 w-5 flex-shrink-0 transition-colors" /> },
  ];

  // Choose navigation based on user type
  const navigation = player ? playerNavigation : organizationNavigation;

  return (
    <div className="flex flex-col md:flex-row bg-[rgb(247,247,249)] w-full flex-1 h-screen overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {navigation.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: organization?.name || player?.display_name || 'User',
                href: '/settings',
                icon: organization?.logo_url || player?.photo_url ? (
                  <img
                    src={organization?.logo_url || player?.photo_url || ''}
                    className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                    alt="Avatar"
                  />
                ) : (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                    {(organization?.name || player?.display_name || 'U').charAt(0).toUpperCase()}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="h-full">{children}</div>
      </main>
    </div>
  );
}

const Logo = () => {
  return (
    <Link
      to="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-[rgb(29,29,31)] py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-[rgb(29,29,31)] whitespace-pre"
      >
        RosterUp
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-[rgb(29,29,31)] py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
