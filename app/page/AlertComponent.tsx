'use client';

import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';

const AlertComponent = () => {
  const [open] = useState(true);

  if (!open) return;
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>로그인을 하여주세요.</AlertTitle>
      <AlertDescription>
        정상적인 서비스 이용을 위해 로그인이 필요합니다.
      </AlertDescription>
    </Alert>
  );
};

export default AlertComponent;
