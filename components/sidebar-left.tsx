'use client';

import * as React from 'react';
import { Home, Sparkles, Inbox, Folder } from 'lucide-react';
import { NavFavorites } from '@/components/nav-favorites';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavWorkspaces } from '@/components/nav-workspaces';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

// Minimal sample data adjusted for studio routing
const data = {
  teams: [
    { name: 'Alpha', logo: Home, plan: 'Pro' },
    { name: 'Beta', logo: Home, plan: 'Free' },
  ],
  favorites: [
    { name: 'Project Management & Task Tracking', url: '/studio/projects', emoji: '�' },
    { name: 'AI Research', url: '/studio/ask-ai', emoji: '🧠' },
  ],
  workspaces: [
    { name: 'Quant', emoji: '📈', pages: [ { name: 'Signals', url: '#', emoji: '�' }, { name: 'Models', url: '#', emoji: '🧪' } ] },
  ],
  navSecondary: [
    { title: 'Settings', url: '#', icon: Folder },
  ],
};

const mainNav = [
  { title: 'Home', url: '/studio/home', icon: Home },
  { title: 'Ask AI', url: '/studio/ask-ai', icon: Sparkles },
  { title: 'Inbox', url: '/studio/inbox', icon: Inbox },
  { title: 'Projects', url: '/studio/projects', icon: Folder },
];

export function SidebarLeft(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        <NavMain
          items={mainNav.map((i) => ({ ...i, isActive: pathname?.startsWith(i.url) }))}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={data.favorites} />
        <NavWorkspaces workspaces={data.workspaces} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

