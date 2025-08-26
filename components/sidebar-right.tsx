import * as React from 'react';
import { Plus } from 'lucide-react';

import { Calendars } from '@/components/calendars';
import { DatePicker } from '@/components/date-picker';
import { NavUser } from '@/components/nav-user';
import { NavAuthLoggedOut } from '@/components/nav-auth-logged-out';
import { AccountsSection } from '@/components/accounts-section';
import { supabase } from '@/lib/supabaseClient';
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
  const [auth, setAuth] = React.useState<{ loggedIn: boolean; user?: typeof data.user | { name?: string; email?: string; avatar?: string } }>(
    { loggedIn: false }
  );

  // Listen to Supabase auth state changes (Kakao OAuth result)
  React.useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data.session) {
        const user = data.session.user;
        setAuth({
          loggedIn: true,
          user: {
            name: user.user_metadata?.name || user.email || 'User',
            email: user.email || '',
            avatar: user.user_metadata?.avatar_url || '/avatars/shadcn.jpg',
          },
        });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session) {
        const user = session.user;
        setAuth({
          loggedIn: true,
          user: {
            name: user.user_metadata?.name || user.email || 'User',
            email: user.email || '',
            avatar: user.user_metadata?.avatar_url || '/avatars/shadcn.jpg',
          },
        });
      } else {
        setAuth({ loggedIn: false });
      }
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        {auth.loggedIn && auth.user ? (
          <NavUser
            user={{
              name: auth.user.name || 'User',
              email: auth.user.email || '',
              avatar: auth.user.avatar || '/avatars/shadcn.jpg',
            }}
            onLogout={async () => {
              await supabase.auth.signOut();
              setAuth({ loggedIn: false });
            }}
          />
        ) : (
          <NavAuthLoggedOut
            onLogin={async ({ id, password }) => {
              // Placeholder: manual email login disabled; keep for future.
              if (id && password) {
                setAuth({ loggedIn: true, user: data.user });
              }
            }}
          />
        )}
      </SidebarHeader>
      <SidebarContent>
        <AccountsSection disabled={!auth.loggedIn} />
        <div className="pt-2">
          <DatePicker />
        </div>
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
