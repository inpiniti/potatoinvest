//1. 최근 당첨번호 리스트
//클릭한 숫자가 상단에 표시
//최대 20개까지 유지
//색상: 빨강/검정/초록(0, 00)

//2. 룰렛 번호 버튼 (0, 00, 1~36)
//0, 00: 초록색
//빨강 숫자: 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
//나머지: 검정색
//10열 그리드 레이아웃

//3. 베팅 옵션 상태 (6가지)
//1-18: 1~18 당첨 시 카운트 감소, 미당첨 시 증가
//19-36: 19~36 당첨 시 카운트 감소, 미당첨 시 증가
//짝수: 짝수 당첨 시 카운트 감소, 홀수 당첨 시 증가
//홀수: 홀수 당첨 시 카운트 감소, 짝수 당첨 시 증가
//빨강: 빨강 당첨 시 카운트 감소, 검정 당첨 시 증가
//검정: 검정 당첨 시 카운트 감소, 빨강 당첨 시 증가

//4. 카운팅 시스템
//레벨: 0 ~ 24 (25단계)
//금액 시퀀스: 1 → 2 → 3 → 5 → 10 → 20 → 30 → 50 → 100 → ... → 1,000,000
//당첨 시: 레벨 -1 (최소 0)
//미당첨 시: 레벨 +1 (최대 24)
//0, 00: 카운팅에 영향 없음 (리스트에만 추가)

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// 카운팅 증가 시퀀스
const COUNT_SEQUENCE = [
  -1000000, -500000, -300000, -200000, -100000, -50000, -30000, -20000, -10000,
  -5000, -3000, -2000, -1000, -500, -300, -200, -100, -50, -30, -20, -10, -5,
  -3, -2, -1, 0, 1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000,
  3000, 5000, 10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000,
  1000000,
];

const INITIAL_INDEX = COUNT_SEQUENCE.indexOf(0); // 0의 인덱스 (25)

// 빨간색 숫자들 (룰렛 표준)
const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

const TestPage = () => {
  // 최근 당첨번호 리스트 (최대 20개)
  const [recentNumbers, setRecentNumbers] = useState([]);

  // 각 베팅 옵션의 카운팅 상태
  const [counts, setCounts] = useState({
    "1-18": INITIAL_INDEX, // 0에서 시작 (인덱스 25)
    "19-36": INITIAL_INDEX,
    even: INITIAL_INDEX, // 짝수
    odd: INITIAL_INDEX, // 홀수
    red: INITIAL_INDEX, // 빨강
    black: INITIAL_INDEX, // 검정
  });

  // 숫자 클릭 핸들러
  const handleNumberClick = (num) => {
    // 최근 당첨번호에 추가 (최대 20개 유지)
    setRecentNumbers((prev) => [num, ...prev].slice(0, 20));

    // 0, 00은 카운팅 하지 않음
    if (num === 0 || num === "00") {
      return;
    }

    // 카운팅 업데이트
    setCounts((prev) => {
      const newCounts = { ...prev };

      // 1-18
      if (num >= 1 && num <= 18) {
        newCounts["1-18"] = newCounts["1-18"] - 1;
      } else {
        newCounts["1-18"] = newCounts["1-18"] + 1;
      }

      // 19-36
      if (num >= 19 && num <= 36) {
        newCounts["19-36"] = newCounts["19-36"] - 1;
      } else {
        newCounts["19-36"] = newCounts["19-36"] + 1;
      }

      // 짝수
      if (num % 2 === 0) {
        newCounts.even = newCounts.even - 1;
      } else {
        newCounts.even = newCounts.even + 1;
      }

      // 홀수
      if (num % 2 === 1) {
        newCounts.odd = newCounts.odd - 1;
      } else {
        newCounts.odd = newCounts.odd + 1;
      }

      // 빨강
      if (RED_NUMBERS.includes(num)) {
        newCounts.red = newCounts.red - 1;
      } else {
        newCounts.red = newCounts.red + 1;
      }

      // 검정
      if (!RED_NUMBERS.includes(num)) {
        newCounts.black = newCounts.black - 1;
      } else {
        newCounts.black = newCounts.black + 1;
      }

      return newCounts;
    });
  };

  // 숫자 버튼 색상 결정
  const getNumberColor = (num) => {
    if (num === 0 || num === "00") return "bg-green-600";
    if (RED_NUMBERS.includes(num)) return "bg-red-600";
    return "bg-black";
  };

  // 리셋 버튼
  const handleReset = () => {
    setRecentNumbers([]);
    setCounts({
      "1-18": 0,
      "19-36": 0,
      even: 0,
      odd: 0,
      red: 0,
      black: 0,
    });
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">룰렛 시뮬레이터</h1>
        <Button onClick={handleReset} variant="outline">
          리셋
        </Button>
      </div>

      {/* 최근 당첨번호 리스트 */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">최근 당첨번호</h2>
        <div className="flex gap-2 flex-wrap">
          {recentNumbers.length === 0 ? (
            <span className="text-gray-400">당첨 번호가 없습니다</span>
          ) : (
            recentNumbers.map((num, idx) => (
              <Badge
                key={idx}
                className={`${getNumberColor(
                  num
                )} text-white text-lg px-3 py-1`}
              >
                {num}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* 룰렛 번호 버튼 (0, 00, 1~36) */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-2">룰렛 번호</h2>
        <div className="grid grid-cols-10 gap-2 mb-2">
          {/* 0과 00 */}
          <Button
            onClick={() => handleNumberClick(0)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            0
          </Button>
          <Button
            onClick={() => handleNumberClick("00")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            00
          </Button>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {/* 1~36 */}
          {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
            <Button
              key={num}
              onClick={() => handleNumberClick(num)}
              className={`${getNumberColor(
                num
              )} hover:opacity-80 text-white font-bold`}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      {/* 베팅 옵션 상태 */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-4">베팅 옵션 상태</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { key: "1-18", label: "1-18" },
            { key: "19-36", label: "19-36" },
            { key: "even", label: "짝수" },
            { key: "odd", label: "홀수" },
            { key: "red", label: "빨강" },
            { key: "black", label: "검정" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="p-4 border rounded-lg bg-gray-50 flex flex-col items-center"
            >
              <span className="text-sm font-semibold mb-2">{label}</span>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">
                  카운트 레벨: {counts[key]}
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {COUNT_SEQUENCE[counts[key]].toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 설명 */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold mb-2">사용 방법</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>숫자를 클릭하면 당첨번호에 추가됩니다</li>
          <li>0, 00은 카운팅에 영향을 주지 않고 당첨번호에만 추가됩니다</li>
          <li>각 옵션은 당첨 시 카운트 레벨이 1 감소합니다</li>
          <li>미당첨 시 카운트 레벨이 1 증가합니다</li>
          <li>카운트 레벨에 따라 배팅 금액이 결정됩니다</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
