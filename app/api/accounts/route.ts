import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { encryptSecret, isEncryptionAvailable } from '@/lib/secretCrypto';

// Headers: Authorization: Bearer <supabase access token>
// POST body accepts either { accountNumber, apiKey, apiSecret } or { account, apiKey, secretKey }
// Table: public.brokerage_accounts (see README for schema & RLS policies)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY; // server only

function getAdmin() {
  if (!SERVICE_ROLE) throw new Error('Server misconfigured: missing service role key');
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

async function getUserFromAuthHeader(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const admin = getAdmin();
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return { user, token };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getUserFromAuthHeader(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = getAdmin();
    const { data, error } = await admin
      .from('brokerage_accounts')
      .select('id, account_no, created_at, alias')
      .eq('user_id', auth.user.id)
      .order('id', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // alias account_no -> account_number for UI
    return NextResponse.json({ accounts: (data || []).map(r => ({ id: r.id, account_number: r.account_no, created_at: r.created_at, alias: r.alias })) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getUserFromAuthHeader(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const accountRaw = body.accountNumber || body.account;
    const apiKey = body.apiKey;
    const apiSecretRaw = body.apiSecret || body.secretKey;
    const alias: string | null = body.alias || body.nickname || body.name || null;
    if (!accountRaw || !apiKey || !apiSecretRaw) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Hash (immutable) + encryption (reversible for token issuance). Encryption required for login flow.
    const secretHash = crypto.createHash('sha256').update(apiSecretRaw).digest('hex');
    let secretEnc: string | null = null;
    try {
      secretEnc = encryptSecret(apiSecretRaw);
    } catch (err) {
      // Provide explicit feedback instead of silently ignoring so user can fix env configuration.
      console.error('Account secret encryption failed:', err);
      if (!isEncryptionAvailable()) {
        return NextResponse.json({
          error: 'Encryption key missing or invalid. Set ACCOUNT_SECRET_ENC_KEY (32-byte raw / 64-char hex / base64) then re-add the account.'
        }, { status: 500 });
      }
      return NextResponse.json({ error: 'Secret encryption failed' }, { status: 500 });
    }
    const admin = getAdmin();
  const { data, error } = await admin
      .from('brokerage_accounts')
      .insert({
        user_id: auth.user.id,
        account_no: accountRaw,
        api_key: apiKey,
  secret_key_hash: secretHash,
  secret_key_enc: secretEnc,
        alias,
      })
      .select('id')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getUserFromAuthHeader(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const admin = getAdmin();
    // Ensure row belongs to user via delete filter
    const { error, count } = await admin
      .from('brokerage_accounts')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', auth.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
