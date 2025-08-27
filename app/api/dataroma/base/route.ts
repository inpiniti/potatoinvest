import { NextRequest, NextResponse } from 'next/server';
import { generateDataromaBase } from '../../../../dataroma_portfolio';

// GET /api/dataroma/base?lookup=keyword
// Returns: { based_on_person: [{ no, name, totalValue }], based_on_stock: [{ stock, person_count, sum_ratio }] }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lookup = searchParams.get('lookup') || undefined;
    const base = await generateDataromaBase({ lookup });

  interface PersonRaw { no: number; name: string; totalValue?: string | null }
  interface StockRaw { stock: string; person_count: number; sum_ratio: string }
  interface BaseResult { based_on_person?: PersonRaw[]; based_on_stock?: StockRaw[] }
  const b = base as unknown as BaseResult;
  const based_on_person = b.based_on_person?.map((p) => ({
      no: p.no,
      name: p.name,
      totalValue: p.totalValue || null,
    })) || [];
  const based_on_stock = b.based_on_stock?.map((s) => ({
      stock: s.stock,
      person_count: s.person_count,
      sum_ratio: s.sum_ratio,
    })) || [];

    return NextResponse.json({ based_on_person, based_on_stock }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
