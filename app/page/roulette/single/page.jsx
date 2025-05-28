"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function RoulettePage() {
  // 38개 칸 클릭 여부 추적
  const [everClicked, setEverClicked] = useState(Array(38).fill(false));
  // 클릭 히스토리만 보존
  const [clickHistory, setClickHistory] = useState([]);
  // 카운터 추가
  const [counter, setCounter] = useState(0);

  // 룰렛 레이아웃 - 0과 00 포함
  const rouletteLayout = [
    // 첫 번째 행 (상단 0, 00)
    [0, 37], // 0과 00
    // 두 번째 행
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    // 세 번째 행
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    // 네 번째 행
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];

  // 숫자 색상 결정 함수 (실제 룰렛 색상 배치)
  const getNumberColor = (num, wasClicked) => {
    // 색상 설정
    let baseColor;

    if (num === 0 || num === 37) {
      baseColor = "bg-green-700 text-white"; // 0과 00은 초록색
    } else {
      const redNumbers = [
        1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
      ];
      baseColor = redNumbers.includes(num)
        ? "bg-red-600 text-white"
        : "bg-black text-white";
    }

    // 클릭 여부에 따른 투명도 조절 - 반전: 클릭한 칸이 뿌옇게
    return wasClicked ? `${baseColor} opacity-40` : baseColor;
  };

  // 숫자를 표시용 텍스트로 변환
  const getDisplayNumber = (num) => {
    if (num === 0) return "0";
    if (num === 37) return "00";
    return num.toString();
  };

  // 버튼 클릭 핸들러 - 카운터 로직 추가
  const handleNumberClick = (num) => {
    // 클릭 이력 업데이트 (최대 10개까지만 저장)
    const displayNum = num === 37 ? "00" : num.toString();
    const newHistory = [displayNum, ...clickHistory.slice(0, 9)];

    // 카운터 업데이트 - 클릭 여부에 따라 다르게 처리
    if (everClicked[num]) {
      // 이미 클릭한 칸이면 카운터 증가
      setCounter((prev) => prev + 1);
    } else {
      // 처음 클릭하는 칸이면 카운터 초기화
      setCounter(0);
    }

    // 클릭된 칸 기록 업데이트
    const newEverClicked = [...everClicked];
    newEverClicked[num] = true;

    // 상태 업데이트
    setClickHistory(newHistory);
    setEverClicked(newEverClicked);
  };

  // 클릭된 칸 수 계산
  const clickedCount = useMemo(
    () => everClicked.filter((clicked) => clicked).length,
    [everClicked]
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">룰렛 게임 (클릭 히스토리)</h1>

      {/* 클릭 상태 정보 */}
      <div className="mb-4 bg-blue-50 p-2 rounded border border-blue-200">
        <p className="font-bold">클릭된 칸: {clickedCount}/38</p>
        <p className="text-sm text-gray-600">
          * 한 번이라도 클릭한 칸은 흐리게, 클릭되지 않은 칸은 선명하게
          표시됩니다.
        </p>
      </div>

      {/* 최근 클릭 이력 표시 */}
      <div className="mb-4">
        <h2 className="font-bold mb-2">최근 클릭 이력:</h2>
        <div className="flex flex-wrap gap-2">
          {clickHistory.length === 0 ? (
            <p className="text-gray-500">아직 클릭 이력이 없습니다.</p>
          ) : (
            clickHistory.map((num, index) => (
              <div
                key={index}
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  num === "0" || num === "00"
                    ? "bg-green-700 text-white"
                    : getNumberColor(parseInt(num), true)
                } ${index === 0 ? "ring-2 ring-yellow-400 ring-offset-2" : ""}`}
              >
                {num}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 카운터 표시 - 새로 추가 */}
      <div className="mb-6 bg-yellow-100 p-4 rounded-md border border-yellow-300 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">연속 점수:</h2>
          <p className="text-sm text-gray-600">
            이미 클릭한 칸을 다시 클릭: +1 점<br />
            처음 클릭하는 칸: 0점으로 초기화
          </p>
        </div>
        <div className="text-4xl font-bold text-yellow-700 bg-white py-2 px-6 rounded-lg shadow">
          {counter}
        </div>
      </div>

      {/* 룰렛 보드 */}
      <div className="mb-6 border-2 border-green-800 inline-block">
        {/* 0과 00 상단 행 */}
        <div className="flex justify-center">
          {rouletteLayout[0].map((num) => (
            <div key={num} className="relative m-0.5">
              <Button
                onClick={() => handleNumberClick(num)}
                className={`w-20 h-20 flex items-center justify-center ${getNumberColor(
                  num,
                  everClicked[num]
                )} rounded-none ${
                  clickHistory[0] === getDisplayNumber(num)
                    ? "ring-2 ring-yellow-400"
                    : ""
                }`}
              >
                <span className="text-3xl font-bold">
                  {getDisplayNumber(num)}
                </span>
              </Button>
            </div>
          ))}
        </div>

        {/* 나머지 숫자들 */}
        {rouletteLayout.slice(1).map((row, rowIndex) => (
          <div key={rowIndex + 1} className="flex">
            {row.map((num) => (
              <div key={num} className="relative m-0.5">
                <Button
                  onClick={() => handleNumberClick(num)}
                  className={`w-20 h-20 flex items-center justify-center ${getNumberColor(
                    num,
                    everClicked[num]
                  )} rounded-none ${
                    clickHistory[0] === num.toString()
                      ? "ring-2 ring-yellow-400"
                      : ""
                  }`}
                >
                  <span className="text-3xl font-bold">{num}</span>
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 룰렛 설명 */}
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="font-bold mb-2">게임 설명</h2>
        <ul className="list-disc pl-5">
          <li>
            <strong>이 룰렛 게임은 클릭 히스토리와 점수를 추적합니다.</strong>
          </li>
          <li>
            숫자를 클릭하면 클릭 이력이 기록되고, 한 번이라도 클릭한 칸은 흐리게
            표시됩니다.
          </li>
          <li>가장 최근에 클릭한 숫자는 노란색 테두리로 강조됩니다.</li>
          <li>클릭 이력은 최대 10개까지 표시됩니다.</li>
          <li className="font-bold mt-2">
            점수 시스템:
            <ul className="font-normal mt-1">
              <li>이미 클릭한 칸을 다시 클릭하면 점수가 1점 증가합니다.</li>
              <li>
                한 번도 클릭하지 않은 칸을 클릭하면 점수가 0으로 초기화됩니다.
              </li>
              <li>높은 점수를 얻으려면 같은 칸을 계속 클릭하세요!</li>
            </ul>
          </li>
        </ul>
      </div>

      {/* 모든 칸의 클릭 상태 */}
      <details className="mt-6 border p-2 rounded">
        <summary className="font-semibold cursor-pointer">
          모든 칸의 클릭 상태 자세히 보기
        </summary>
        <div className="grid grid-cols-6 md:grid-cols-8 gap-2 mt-2">
          {[...Array(38)].map((_, i) => {
            const displayNum = getDisplayNumber(i);
            return (
              <div
                key={i}
                className={`border p-2 rounded-md ${
                  !everClicked[i] ? "opacity-50" : ""
                } text-sm`}
              >
                <p className="font-bold">{displayNum}</p>
                <p>클릭 여부: {everClicked[i] ? "✓" : "✗"}</p>
              </div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
