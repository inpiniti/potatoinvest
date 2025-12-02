import { NextRequest, NextResponse } from 'next/server';
import { detectTrendChange, analyzeTrendDetails, CandleData } from '@/utils/trendAnalysis';

export async function POST(request: NextRequest) {
    try {
        const { candleData } = await request.json();

        if (!candleData || !Array.isArray(candleData)) {
            return NextResponse.json(
                { error: '분봉 데이터가 필요합니다.' },
                { status: 400 }
            );
        }

        // clos 필드가 없으면 last 필드를 사용
        const processedData: CandleData[] = candleData.map((item: { clos?: string | number; last?: string | number; xymd?: string;[key: string]: unknown }) => ({
            ...item,
            clos: item.clos || item.last || 0,
            xymd: item.xymd || "00000000" // Ensure xymd exists
        }));

        const trendStatus = detectTrendChange(processedData);
        const details = analyzeTrendDetails(processedData);

        return NextResponse.json({
            success: true,
            trendStatus,
            details: {
                currentSlope: details.currentSlope,
                pastSlopes: details.pastSlopes,
                closePrices: details.closePrices,
                movingAverages: details.movingAverages,
                slopes: details.slopes
            }
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
