/**
 * 분봉/일봉 데이터 타입 정의
 */
export interface CandleData {
    clos: string | number;
    xymd: string;
    xhms?: string;
    [key: string]: any;
}

export type TrendStatus = '상승전환' | '하락전환' | '상승' | '하락' | '유지';

/**
 * 고정 샘플링 간격 반환
 */
function getSamplingInterval(maPeriod: number): number {
    if (maPeriod === 20) return 1;
    if (maPeriod === 50) return 5;
    if (maPeriod === 100) return 20;
    if (maPeriod === 200) return 40;
    return Math.max(1, Math.floor(maPeriod / 20));
}

export function detectTrendChange(
    candleData: CandleData[],
    maPeriod: number = 20,
    threshold: number = 0.01
): TrendStatus {
    const samplingInterval = getSamplingInterval(maPeriod);
    const sampleCount = 5;
    const requiredDataCount = maPeriod + (sampleCount - 1) * samplingInterval;

    if (!candleData || candleData.length < requiredDataCount) {
        return '유지';
    }

    const closePrices = candleData.map(candle => {
        const price = typeof candle.clos === 'string' ? parseFloat(candle.clos) : candle.clos;
        if (isNaN(price)) {
            throw new Error('유효하지 않은 종가 데이터가 포함되어 있습니다.');
        }
        return price;
    });

    const movingAverages = calculateMovingAverages(closePrices, maPeriod);
    const slopes = calculateSlopes(movingAverages);

    return detectTrend(slopes, threshold, maPeriod, samplingInterval);
}

function calculateMovingAverages(prices: number[], period: number): number[] {
    const movingAverages: number[] = [];

    for (let i = 0; i <= prices.length - period; i++) {
        const slice = prices.slice(i, i + period);
        const average = slice.reduce((sum, price) => sum + price, 0) / period;
        movingAverages.push(average);
    }

    return movingAverages;
}

function calculateSlopes(movingAverages: number[]): number[] {
    const slopes: number[] = [];

    for (let i = 0; i < movingAverages.length - 1; i++) {
        const current = movingAverages[i];
        const previous = movingAverages[i + 1];
        const slope = ((current - previous) / previous) * 100;
        slopes.push(slope);
    }

    return slopes;
}

function detectTrend(
    slopes: number[],
    threshold: number,
    maPeriod: number,
    samplingInterval: number
): TrendStatus {
    const sampleCount = 5;
    const requiredSlopeCount = (sampleCount - 1) * samplingInterval + 1;

    if (slopes.length < requiredSlopeCount) {
        return '유지';
    }

    const sampledSlopes: number[] = [];
    for (let i = 0; i < sampleCount; i++) {
        const index = i * samplingInterval;
        if (index < slopes.length) {
            sampledSlopes.push(slopes[index]);
        }
    }

    console.log(`[MA${maPeriod}] 간격: ${samplingInterval}일, 샘플: [${sampledSlopes.map(s => s.toFixed(4)).join(', ')}], 임계값: ${threshold.toFixed(6)}%`);

    const currentSlope = sampledSlopes[0];
    const pastSlopes = sampledSlopes.slice(1);

    const isUpwardReversal = currentSlope >= 0 && pastSlopes.every(slope => slope < 0);
    const isDownwardReversal = currentSlope <= 0 && pastSlopes.every(slope => slope > 0);

    if (isUpwardReversal) {
        console.log(`[MA${maPeriod}] ✅ 상승전환 감지`);
        return '상승전환';
    }

    if (isDownwardReversal) {
        console.log(`[MA${maPeriod}] ✅ 하락전환 감지`);
        return '하락전환';
    }

    if (currentSlope > threshold) {
        console.log(`[MA${maPeriod}] ✅ 상승 (${currentSlope.toFixed(6)}% > ${threshold.toFixed(6)}%)`);
        return '상승';
    }

    if (currentSlope < -threshold) {
        console.log(`[MA${maPeriod}] ✅ 하락 (${currentSlope.toFixed(6)}% < -${threshold.toFixed(6)}%)`);
        return '하락';
    }

    console.log(`[MA${maPeriod}] ⚪ 유지 (${currentSlope.toFixed(6)}% 범위 내)`);
    return '유지';
}

export function analyzeMultipleMAs(candleData: CandleData[]): {
    ma20: { status: TrendStatus; slope: number };
    ma50: { status: TrendStatus; slope: number };
    ma100: { status: TrendStatus; slope: number };
    ma200: { status: TrendStatus; slope: number };
} {
    const analyze = (period: number) => {
        const closePrices = candleData.map(candle => {
            const price = typeof candle.clos === 'string' ? parseFloat(candle.clos) : candle.clos;
            return price;
        });

        const samplingInterval = getSamplingInterval(period);

        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`[MA${period}] 📊 원본 데이터: ${candleData.length}개, 샘플링 간격: ${samplingInterval}일`);

        // 원본 종가 데이터 출력
        const displayCount = period >= 100 ? 100 : 20;
        console.log(`[MA${period}] 💰 원본 종가 (처음 ${displayCount}개):`, closePrices.slice(0, displayCount));

        // 가격 통계
        const priceStats = {
            min: Math.min(...closePrices),
            max: Math.max(...closePrices),
            avg: closePrices.reduce((sum, p) => sum + p, 0) / closePrices.length,
            first: closePrices[0],
            last: closePrices[closePrices.length - 1],
        };
        console.log(`[MA${period}] 📊 가격 통계: 최소=${priceStats.min.toFixed(2)}, 최대=${priceStats.max.toFixed(2)}, 평균=${priceStats.avg.toFixed(2)}, 최신=${priceStats.first.toFixed(2)}, 최초=${priceStats.last.toFixed(2)}`);

        const movingAverages = calculateMovingAverages(closePrices, period);
        const slopes = calculateSlopes(movingAverages);

        console.log(`[MA${period}] 📊 이평: ${movingAverages.length}개 → 기울기: ${slopes.length}개`);

        // 샘플링된 이동평균 값 출력
        const sampledMAIndices = [0, samplingInterval, samplingInterval * 2, samplingInterval * 3, samplingInterval * 4];
        const sampledMAs = sampledMAIndices.map(i => i < movingAverages.length ? movingAverages[i] : null).filter(v => v !== null);
        console.log(`[MA${period}] 📈 샘플링된 이동평균 (${samplingInterval}일 간격):`, sampledMAs);

        if (slopes.length === 0) {
            console.error(`[MA${period}] ❌ 기울기 계산 실패!`);
            return { status: '유지' as TrendStatus, slope: 0 };
        }

        // 샘플링된 기울기 출력
        const sampledSlopeIndices = [0, samplingInterval, samplingInterval * 2, samplingInterval * 3, samplingInterval * 4];
        const sampledSlopes = sampledSlopeIndices.map(i => i < slopes.length ? slopes[i] : null).filter(v => v !== null);
        console.log(`[MA${period}] 📉 샘플링된 기울기 (${samplingInterval}일 간격):`, sampledSlopes);

        const currentSlope = slopes[0];
        console.log(`[MA${period}] 🎯 현재 기울기: ${currentSlope.toFixed(8)}%`);

        const threshold = 0.2 / period;
        const status = detectTrendChange(candleData, period, threshold);

        return { status, slope: currentSlope };
    };

    return {
        ma20: analyze(20),
        ma50: analyze(50),
        ma100: analyze(100),
        ma200: analyze(200),
    };
}
