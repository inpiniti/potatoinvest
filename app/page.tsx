'use client';

import { useState } from 'react';
import { LandingPage } from '@/components/LandingPage';
import { DownloadPage } from '@/components/DownloadPage';
import { TermsPage } from '@/components/TermsPage';
import { PrivacyPage } from '@/components/PrivacyPage';
import { useRouter } from 'next/navigation';

type ViewType = 'landing' | 'login' | 'app' | 'download' | 'terms' | 'privacy';
export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/start/account');
  };

  const handleNavigateTo = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            onNavigateTo={handleNavigateTo}
          />
        );
      case 'download':
        return <DownloadPage onBack={handleBackToLanding} />;
      case 'terms':
        return <TermsPage onBack={handleBackToLanding} />;
      case 'privacy':
        return <PrivacyPage onBack={handleBackToLanding} />;
      default:
        return (
          <LandingPage
            onGetStarted={handleGetStarted}
            onNavigateTo={handleNavigateTo}
          />
        );
    }
  };

  return renderCurrentView();
}
