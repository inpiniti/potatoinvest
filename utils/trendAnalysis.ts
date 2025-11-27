/**
 * 분봉/일봉 데이터 타입 정의
 */
export interface CandleData {
    clos: string | number; // 종가
    xymd: string; // 날짜 (YYYYMMDD)
    xhms?: string; // 시간 (HHMMSS) - 분봉의 경우
    [key: string]: any; // 기타 필드
}

/**
 * 추세 상태 타입
 */
export type TrendStatus = '상승전환' | '하락전환' | '상승' | '하락' | '유지';

/**
 * 이동평균선 기울기 변화를 분석하여 추세 전환을 감지하는 함수
 * 
 * @param candleData - 분봉 또는 일봉 데이터 배열 (최신순 정렬, 120개)
 * @param maPeriod - 이동평균 기간 (기본값: 20)
 * @param threshold - 기울기 임계값 (기본값: 0.01%)
 * @returns 추세 상태: '상승전환' | '하락전환' | '상승' | '하락' | '유지'
 */
export function detectTrendChange(
    candleData: CandleData[],
    maPeriod: number = 20,
    threshold: number = 0.01
): TrendStatus {
    // 1. 입력 데이터 검증
    if (!candleData || candleData.length < maPeriod + 5) {
        throw new Error(`최소 ${maPeriod + 5}개 이상의 데이터가 필요합니다.`);
    }

    // 2. 종가 데이터 추출 및 숫자 변환
    const closePrices = candleData.map(candle => {
        const price = typeof candle.clos === 'string' ? parseFloat(candle.clos) : candle.clos;
        if (isNaN(price)) {
            throw new Error('유효하지 않은 종가 데이터가 포함되어 있습니다.');
        }
        return price;
    });

    // 3. 이동평균 계산
    const movingAverages = calculateMovingAverages(closePrices, maPeriod);

    // 4. 기울기 계산
    const slopes = calculateSlopes(movingAverages);

    // 5. 추세 전환 감지
    return detectTrend(slopes, threshold);
}

/**
 * 이동평균 계산
 * 
 * @param prices - 종가 배열 (최신순)
 * @param period - 이동평균 기간
 * @returns 이동평균 배열
 */
function calculateMovingAverages(prices: number[], period: number): number[] {
    const movingAverages: number[] = [];

    for (let i = 0; i <= prices.length - period; i++) {
        const slice = prices.slice(i, i + period);
        const average = slice.reduce((sum, price) => sum + price, 0) / period;
        movingAverages.push(average);
    }

    return movingAverages;
}

/**
 * 기울기 계산
 * 
 * @param movingAverages - 이동평균 배열
 * @returns 기울기 배열 (%)
 */
function calculateSlopes(movingAverages: number[]): number[] {
    const slopes: number[] = [];

    for (let i = 0; i < movingAverages.length - 1; i++) {
        const current = movingAverages[i];
        const previous = movingAverages[i + 1];

        // 기울기 = (현재 - 이전) / 이전 * 100 (%)
        const slope = ((current - previous) / previous) * 100;
        slopes.push(slope);
    }

    return slopes;
}

/**
 * 추세 감지
 * 
 * @param slopes - 기울기 배열 (최신순)
 * @param threshold - 기울기 임계값 (%)
 * @returns 추세 상태
 */
function detectTrend(slopes: number[], threshold: number): TrendStatus {
    if (slopes.length < 5) {
        throw new Error('기울기 계산을 위해 최소 5개 이상의 데이터가 필요합니다.');
    }

    const currentSlope = slopes[0]; // 현재 기울기
    const pastSlopes = slopes.slice(1, 5); // 과거 1~4일 기울기

    // 상승전환 조건: 현재 >= 0, 과거 모두 < 0
    const isUpwardReversal =
        currentSlope >= 0 &&
        pastSlopes.every(slope => slope < 0);

    // 하락전환 조건: 현재 <= 0, 과거 모두 > 0
    const isDownwardReversal =
        currentSlope <= 0 &&
        pastSlopes.every(slope => slope > 0);

    if (isUpwardReversal) {
        return '상승전환';
    }

    if (isDownwardReversal) {
        return '하락전환';
    }

    // 상승 조건: 현재 기울기 > 임계값
    if (currentSlope > threshold) {
        return '상승';
    }

    // 하락 조건: 현재 기울기 < -임계값
    if (currentSlope < -threshold) {
        return '하락';
    }

    // 유지 조건: 기울기가 임계값 범위 내
    return '유지';
}

/**
 * 디버깅용: 이동평균과 기울기 상세 정보 반환
 * 
 * @param candleData - 분봉 또는 일봉 데이터 배열
 * @param maPeriod - 이동평균 기간
 * @returns 상세 분석 결과
 */
export function analyzeTrendDetails(
    candleData: CandleData[],
    maPeriod: number = 20
) {
    const closePrices = candleData.map(candle =>
        typeof candle.clos === 'string' ? parseFloat(candle.clos) : candle.clos
    );

    const movingAverages = calculateMovingAverages(closePrices, maPeriod);
    const slopes = calculateSlopes(movingAverages);

    return {
        closePrices: closePrices.slice(0, 10), // 최근 10개만
        movingAverages: movingAverages.slice(0, 10),
        slopes: slopes.slice(0, 10),
        currentSlope: slopes[0],
        pastSlopes: slopes.slice(1, 5),
        trend: detectTrendChange(candleData, maPeriod)
    };
}
