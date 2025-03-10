'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Nav from './Nav';
import Header from './Header';

const queryClient = new QueryClient();

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col divide-y divide-neutral-200">
        <Header>
          <Nav />
        </Header>
        <main>
          <div className="container mx-auto p-4">{children}</div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
