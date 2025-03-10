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
      <div className="flex flex-col divide-y divide-neutral-200 bg-neutral-100 min-h-screen">
        <Header>
          <Nav />
        </Header>
        <main className="pt-20 sm:pt-22 md:pt-24 lg:pt-26">
          <div className="container mx-auto p-4">{children}</div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
