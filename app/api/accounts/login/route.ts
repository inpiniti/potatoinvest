import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decryptSecret } from '@/lib/secretCrypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdmin() {
  if (!SERVICE_ROLE) throw new Error('Server misconfigured: missing service role key');
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

async function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const admin = getAdmin();
  const { data: { user } } = await admin.auth.getUser(token);
  return user ?? null;
}

async function requestKoreaInvestmentToken(appkey: string, appsecret: string) {
  const url = 'https://openapivts.koreainvestment.com:29443/oauth2/tokenP';
  const body = { grant_type: 'client_credentials', appkey, appsecret };
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'tokenP 실패');
  return json;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const admin = getAdmin();
    const { data: account, error } = await admin
      .from('brokerage_accounts')
      .select('id, api_key, secret_key_enc')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    if (error || !account) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!account.secret_key_enc) return NextResponse.json({ error: 'Secret not stored encrypted' }, { status: 500 });

    let secret: string;
    try { secret = decryptSecret(account.secret_key_enc); } catch { return NextResponse.json({ error: 'Decrypt failed' }, { status: 500 }); }

    const tokenJson = await requestKoreaInvestmentToken(account.api_key, secret);
    return NextResponse.json({ accountId: account.id, ...tokenJson });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
