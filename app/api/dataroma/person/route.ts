import { NextRequest, NextResponse } from 'next/server';
import { generateDataromaBase } from '../../../../dataroma_portfolio';

// GET /api/dataroma/person?name=Investor%20Name
// Returns: { name, totalValue, portfolio: [{ code, ratio }] }
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) {
      return NextResponse.json({ error: 'name query param required' }, { status: 400 });
    }

    // Use lookup to narrow results; generateDataromaBase returns full objects incl. portfolio
  const base = await generateDataromaBase({ lookup: name });
  interface PortfolioItem { code: string; ratio: string }
  interface PersonFull { no: number; name: string; totalValue?: string | null; portfolio?: PortfolioItem[] }
  const persons = (base as unknown as { based_on_person?: PersonFull[] }).based_on_person || [];
    // Find exact match first, else first partial
    const lc = name.toLowerCase();
    const exact = persons.find(p => p.name?.toLowerCase() === lc);
    const target = exact || persons[0];
    if (!target || !target.portfolio) {
      return NextResponse.json({ error: 'Investor not found' }, { status: 404 });
    }

    // Normalize portfolio entries (ensure code & ratio)
    const portfolio: PortfolioItem[] = Array.isArray(target.portfolio)
      ? target.portfolio.filter((p): p is PortfolioItem => !!p && typeof p.code === 'string' && typeof p.ratio === 'string')
      : [];

    return NextResponse.json({
      name: target.name,
      totalValue: target.totalValue || null,
      portfolio,
    }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
