import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { decryptSecret } from '@/lib/secretCrypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getAdmin() {
  if (!SERVICE_ROLE)
    throw new Error('Server misconfigured: missing service role key');
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });
}

async function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const admin = getAdmin();
  const {
    data: { user },
  } = await admin.auth.getUser(token);
  return user ?? null;
}

interface QueryParams {
  accountId: number;
  isVts?: boolean;
  CANO?: string; // override
  ACNT_PRDT_CD?: string;
  WCRC_FRCR_DVSN_CD?: string;
  NATN_CD?: string;
  TR_MKET_CD?: string;
  INQR_DVSN_CD?: string;
}

// Map various inputs (alpha codes or numeric strings) to documented numeric nation codes.
function normalizeNationCode(input?: string): string {
  if (!input) return '840'; // default 미국
  const trimmed = input.trim().toUpperCase();
  // Already numeric 000, 840, etc.
  if (/^\d{3}$/.test(trimmed)) return trimmed;
  const map: Record<string, string> = {
    US: '840', USA: '840', AMERICA: '840',
    HK: '344', HONGKONG: '344',
    CN: '156', CHINA: '156',
    JP: '392', JAPAN: '392',
    VN: '704', VIETNAM: '704',
    ALL: '000', TOTAL: '000', GLOBAL: '000'
  };
  return map[trimmed] || '840';
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body: QueryParams & { kiAccessToken?: string } = await req
      .json()
      .catch(() => ({}));
    const { accountId, isVts = true } = body;
    if (!accountId)
      return NextResponse.json({ error: 'Missing accountId' }, { status: 400 });

    const admin = getAdmin();
    const { data: account, error } = await admin
      .from('brokerage_accounts')
      .select('id, user_id, account_no, api_key, secret_key_enc')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single();
    if (error || !account)
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    if (!account.secret_key_enc)
      return NextResponse.json(
        { error: 'Secret not encrypted' },
        { status: 500 }
      );
    let apiSecret: string;
    try {
      apiSecret = decryptSecret(account.secret_key_enc);
    } catch {
      return NextResponse.json({ error: 'Decrypt failed' }, { status: 500 });
    }

    // Korea Investment access token must be already obtained separately and passed here
    const kiAccessToken = body.kiAccessToken; // optional improvement: look up from a server cache
    if (!kiAccessToken)
      return NextResponse.json(
        { error: 'Missing kiAccessToken' },
        { status: 400 }
      );

    const port = isVts ? '29443' : '9443';
    const domain = isVts ? 'openapivts' : 'openapi';
    const endpoint = 'uapi/overseas-stock/v1/trading/inquire-present-balance';
    const url = `https://${domain}.koreainvestment.com:${port}/${endpoint}`;
    const trId = isVts ? 'VTRP6504R' : 'CTRP6504R';

    const queryPayload = {
      // Account number spec: stored as either 8-2 with hyphen (########-##) or concatenated ##########.
      // API requires CANO (first 8) and ACNT_PRDT_CD (last 2) separately.
      ...(() => {
        const raw = account.account_no || '';
        let digits = raw.replace(/[^0-9]/g, '');
        if (digits.length < 10) {
          // Fallback: pad or throw? We'll just leave and let KI reject; but we ensure at least structure.
          digits = (digits + 'XXXXXXXXXX').slice(0, 10); // defensive
        }
        const canoDerived = digits.slice(0, 8);
        const prdtDerived = digits.slice(8, 10);
        return {
          CANO: body.CANO || canoDerived,
          ACNT_PRDT_CD: body.ACNT_PRDT_CD || prdtDerived,
        };
      })(),
  WCRC_FRCR_DVSN_CD: body.WCRC_FRCR_DVSN_CD || '02', // 프로젝트 기준: 02=원화, 01=외화 (요청 사항에 따라 기본 02 고정)
      NATN_CD: normalizeNationCode(body.NATN_CD),
      TR_MKET_CD: body.TR_MKET_CD || '00',
      INQR_DVSN_CD: body.INQR_DVSN_CD || '00',
    } as const;
    const qs = new URLSearchParams(queryPayload as Record<string, string>);

    console.log('qs >>> ', qs);

    const kiRes = await fetch(`${url}?${qs.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${kiAccessToken}`,
        appkey: account.api_key,
        appsecret: apiSecret,
        tr_id: trId,
      },
    });
    const json = await kiRes.json();
    if (!kiRes.ok)
      return NextResponse.json(
        { error: 'KI request failed', detail: json },
        { status: 502 }
      );
    return NextResponse.json(json, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    );
  }
}
