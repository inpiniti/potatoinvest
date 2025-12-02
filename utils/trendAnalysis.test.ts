import { detectTrendChange, analyzeTrendDetails, CandleData } from './trendAnalysis';

// 실제 분봉 데이터 (한투 API 응답 형식)
const realBunbongData: CandleData[] = [
    { tymd: "20251126", xymd: "20251126", xhms: "185900", kymd: "20251127", khms: "085900", open: "277.8700", high: "277.9625", low: "277.8700", last: "277.9625", evol: "513", eamt: "142594", clos: "277.9625" },
    { tymd: "20251126", xymd: "20251126", xhms: "185800", kymd: "20251127", khms: "085800", open: "277.8600", high: "277.8810", low: "277.8600", last: "277.8810", evol: "606", eamt: "168384", clos: "277.8810" },
    { tymd: "20251126", xymd: "20251126", xhms: "185700", kymd: "20251127", khms: "085700", open: "277.9300", high: "278.0000", low: "277.9300", last: "278.0000", evol: "25", eamt: "6949", clos: "278.0000" },
    { tymd: "20251126", xymd: "20251126", xhms: "185600", kymd: "20251127", khms: "085600", open: "277.8800", high: "277.9300", low: "277.8800", last: "277.9300", evol: "23", eamt: "6392", clos: "277.9300" },
    { tymd: "20251126", xymd: "20251126", xhms: "185500", kymd: "20251127", khms: "085500", open: "277.8600", high: "277.9300", low: "277.8600", last: "277.8600", evol: "101", eamt: "28069", clos: "277.8600" },
    { tymd: "20251126", xymd: "20251126", xhms: "185400", kymd: "20251127", khms: "085400", open: "277.9764", high: "278.0000", low: "277.9764", last: "278.0000", evol: "22", eamt: "6116", clos: "278.0000" },
    { tymd: "20251126", xymd: "20251126", xhms: "185300", kymd: "20251127", khms: "085300", open: "278.0000", high: "278.0000", low: "277.9700", last: "277.9700", evol: "26", eamt: "7227", clos: "277.9700" },
    { tymd: "20251126", xymd: "20251126", xhms: "185200", kymd: "20251127", khms: "085200", open: "277.9700", high: "277.9700", low: "277.8600", last: "277.9300", evol: "14", eamt: "3891", clos: "277.9300" },
    { tymd: "20251126", xymd: "20251126", xhms: "185100", kymd: "20251127", khms: "085100", open: "277.8800", high: "278.0000", low: "277.8600", last: "277.8600", evol: "32", eamt: "8892", clos: "277.8600" },
    { tymd: "20251126", xymd: "20251126", xhms: "185000", kymd: "20251127", khms: "085000", open: "277.8500", high: "277.9798", low: "277.8500", last: "277.8600", evol: "146", eamt: "40579", clos: "277.8600" },
    { tymd: "20251126", xymd: "20251126", xhms: "184900", kymd: "20251127", khms: "084900", open: "278.0000", high: "278.0000", low: "277.9962", last: "277.9962", evol: "13", eamt: "3614", clos: "277.9962" },
    { tymd: "20251126", xymd: "20251126", xhms: "184800", kymd: "20251127", khms: "084800", open: "277.8500", high: "278.0000", low: "277.8500", last: "277.9962", evol: "6", eamt: "1668", clos: "277.9962" },
    { tymd: "20251126", xymd: "20251126", xhms: "184700", kymd: "20251127", khms: "084700", open: "277.8245", high: "277.8800", low: "277.8200", last: "277.8500", evol: "80", eamt: "22228", clos: "277.8500" },
    { tymd: "20251126", xymd: "20251126", xhms: "184600", kymd: "20251127", khms: "084600", open: "277.8200", high: "277.8605", low: "277.8200", last: "277.8605", evol: "20", eamt: "5557", clos: "277.8605" },
    { tymd: "20251126", xymd: "20251126", xhms: "184500", kymd: "20251127", khms: "084500", open: "278.0000", high: "278.0000", low: "277.7500", last: "277.8800", evol: "26", eamt: "7223", clos: "277.8800" },
    { tymd: "20251126", xymd: "20251126", xhms: "184400", kymd: "20251127", khms: "084400", open: "277.8800", high: "277.9000", low: "277.7500", last: "277.8800", evol: "125", eamt: "34729", clos: "277.8800" },
    { tymd: "20251126", xymd: "20251126", xhms: "184300", kymd: "20251127", khms: "084300", open: "277.9200", high: "277.9200", low: "277.9100", last: "277.9100", evol: "12", eamt: "3335", clos: "277.9100" },
    { tymd: "20251126", xymd: "20251126", xhms: "184200", kymd: "20251127", khms: "084200", open: "277.9937", high: "278.0000", low: "277.7562", last: "278.0000", evol: "22", eamt: "6116", clos: "278.0000" },
    { tymd: "20251126", xymd: "20251126", xhms: "184100", kymd: "20251127", khms: "084100", open: "277.9157", high: "277.9200", low: "277.9157", last: "277.9200", evol: "8", eamt: "2223", clos: "277.9200" },
    { tymd: "20251126", xymd: "20251126", xhms: "184000", kymd: "20251127", khms: "084000", open: "277.8200", high: "278.0000", low: "277.7500", last: "277.9000", evol: "19", eamt: "5279", clos: "277.9000" },
    { tymd: "20251126", xymd: "20251126", xhms: "183900", kymd: "20251127", khms: "083900", open: "277.9666", high: "277.9666", low: "277.7500", last: "277.7500", evol: "110", eamt: "30574", clos: "277.7500" },
    { tymd: "20251126", xymd: "20251126", xhms: "183800", kymd: "20251127", khms: "083800", open: "277.8000", high: "278.0000", low: "277.8000", last: "278.0000", evol: "113", eamt: "31395", clos: "278.0000" },
    { tymd: "20251126", xymd: "20251126", xhms: "183700", kymd: "20251127", khms: "083700", open: "277.7800", high: "277.7800", low: "277.7560", last: "277.7560", evol: "26", eamt: "7222", clos: "277.7560" },
    { tymd: "20251126", xymd: "20251126", xhms: "183600", kymd: "20251127", khms: "083600", open: "277.7500", high: "277.7500", low: "277.7500", last: "277.7500", evol: "5", eamt: "1389", clos: "277.7500" },
    { tymd: "20251126", xymd: "20251126", xhms: "183500", kymd: "20251127", khms: "083500", open: "277.7500", high: "277.9742", low: "277.7500", last: "277.9742", evol: "19", eamt: "5278", clos: "277.9742" },
    { tymd: "20251126", xymd: "20251126", xhms: "183400", kymd: "20251127", khms: "083400", open: "277.7900", high: "277.9800", low: "277.7557", last: "277.7557", evol: "19", eamt: "5279", clos: "277.7557" }
];

// 120개 데이터를 만들기 위해 나머지 추가 (간단히 반복)
for (let i = realBunbongData.length; i < 120; i++) {
    const baseData = realBunbongData[i % realBunbongData.length];
    realBunbongData.push({ ...baseData, clos: baseData.last });
}

console.log('=== 추세 분석 테스트 시작 ===\n');
console.log(`총 데이터 개수: ${realBunbongData.length}개\n`);

try {
    // 1. 기본 추세 감지 테스트
    const trendStatus = detectTrendChange(realBunbongData);
    console.log(`✅ 추세 상태: ${trendStatus}\n`);

    // 2. 상세 분석 테스트
    const details = analyzeTrendDetails(realBunbongData);
    console.log('=== 상세 분석 결과 ===');
    console.log(`현재 기울기: ${details.currentSlope?.toFixed(4)}%`);
    console.log(`과거 기울기 (1~4일): ${details.pastSlopes.map(s => s.toFixed(4)).join(', ')}%`);
    console.log(`\n최근 10개 종가:`);
    console.log(details.closePrices.map(p => p.toFixed(2)).join(', '));
    console.log(`\n최근 10개 이동평균:`);
    console.log(details.movingAverages.map(ma => ma.toFixed(2)).join(', '));
    console.log(`\n최근 10개 기울기:`);
    console.log(details.slopes.map(s => s.toFixed(4)).join(', '));

    console.log('\n=== 테스트 성공! ===');
} catch (error) {
    console.error('❌ 테스트 실패:', error);
}
