import { NextRequest, NextResponse } from 'next/server';
import { detectTrendChange, analyzeTrendDetails } from '@/utils/trendAnalysis';

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
        const processedData = candleData.map((item: any) => ({
            ...item,
            clos: item.clos || item.last
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
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
