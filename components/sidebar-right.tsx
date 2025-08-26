import * as React from 'react';
import { Plus } from 'lucide-react';

import { Calendars } from '@/components/calendars';
import { DatePicker } from '@/components/date-picker';
import { NavUser } from '@/components/nav-user';
import { NavAuthLoggedOut } from '@/components/nav-auth-logged-out';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  calendars: [
    {
      name: 'My Calendars',
      items: ['Personal', 'Work', 'Family'],
    },
    {
      name: 'Favorites',
      items: ['Holidays', 'Birthdays'],
    },
    {
      name: 'Other',
      items: ['Travel', 'Reminders', 'Deadlines'],
    },
  ],
};

export function SidebarRight(
  props: React.ComponentProps<typeof Sidebar>
) {
  const [auth, setAuth] = React.useState<{ loggedIn: boolean; user?: typeof data.user }>(
    { loggedIn: true, user: data.user }
  );

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        {auth.loggedIn && auth.user ? (
          <NavUser
            user={auth.user}
            onLogout={() => setAuth({ loggedIn: false })}
          />
        ) : (
          <NavAuthLoggedOut
            onLogin={async ({ id, password }) => {
              // TODO: 실제 인증 로직 연동 (API 호출)
              // For now accept any non-empty credentials.
              if (id && password) {
                setAuth({ loggedIn: true, user: data.user });
              }
            }}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <DatePicker />
        <SidebarSeparator className="mx-0" />
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled={!auth.loggedIn} title={!auth.loggedIn ? '로그인 후 사용 가능' : undefined}>
              <Plus />
              <span>New Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
