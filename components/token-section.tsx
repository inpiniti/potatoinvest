'use client';
import * as React from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { accountTokenStore } from '@/store/accountTokenStore';

export function TokenSection() {
  const { activeAccountId, tokens } = accountTokenStore();
  const token = activeAccountId ? tokens[activeAccountId] : undefined;

  // derive remaining hours if expires_in is numeric
  let remaining: string | null = null;
  if (token?.expires_in) {
    const num =
      typeof token.expires_in === 'string'
        ? parseInt(token.expires_in, 10)
        : token.expires_in;
    if (!isNaN(num) && num > 0) remaining = (num / 3600).toFixed(1) + 'h';
  }

  return (
    <div className="mt-2 space-y-2 pb-2 border-b">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-semibold text-muted-foreground tracking-wide">
          토큰
        </h4>
        {token ? (
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
        ) : (
          <ShieldOff className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="px-2 pb-1">
        {!token && (
          <p className="text-xs text-muted-foreground">로그인된 계좌 없음</p>
        )}
        {token && (
          <div className="rounded-md border bg-surface-inset px-2 py-1 text-[11px] leading-tight">
            <div className="flex justify-between gap-2 mb-0.5">
              {remaining && (
                <span className="text-[10px] text-muted-foreground">
                  {remaining} 남음
                </span>
              )}
            </div>
            <div
              className="font-mono text-[8px] leading-normal overflow-hidden text-ellipsis whitespace-nowrap"
              title={token.access_token}
            >
              access_token:{' '}
              <span className="text-[6px] text-neutral-400">
                {token.access_token}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
