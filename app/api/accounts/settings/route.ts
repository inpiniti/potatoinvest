import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY; // server only

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
  return user || null;
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { accountId, max_positions, target_cash_ratio } = body || {};
    if (!accountId) return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });

    const updates: Record<string, number> = {};
    if (typeof max_positions === 'number') {
      updates.max_positions = Math.min(50, Math.max(1, Math.floor(max_positions)));
    }
    if (typeof target_cash_ratio === 'number') {
      updates.target_cash_ratio = Math.min(100, Math.max(0, Math.round(target_cash_ratio)));
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
    }

    const admin = getAdmin();
    const { data, error } = await admin
      .from('brokerage_accounts')
      .update(updates)
      .eq('id', accountId)
      .eq('user_id', user.id)
      .select('id, max_positions, target_cash_ratio')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, settings: data });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
