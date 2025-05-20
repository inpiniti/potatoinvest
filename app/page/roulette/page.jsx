"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function RoulettePage() {
  // 배팅액, 횟수, 실제 배팅액(지수) 관리 상태
  const [betAmounts, setBetAmounts] = useState([1, 1, 1, 1, 1, 1]); // 초기 배팅액 모두 1
  const [betCounts, setBetCounts] = useState([0, 0, 0, 0, 0, 0]); // 초기 횟수 모두 0
  const [expoBets, setExpoBets] = useState([1, 1, 1, 1, 1, 1]); // 초기 지수배팅액 모두 1
  const [clickHistory, setClickHistory] = useState([]); // 클릭 이력 저장 배열

  // 숫자 색상 결정 함수 (실제 룰렛 색상 배치)
  const getNumberColor = (num) => {
    const redNumbers = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    return redNumbers.includes(num)
      ? "bg-red-600 text-white"
      : "bg-black text-white";
  };

  // 배팅액 계산 함수 - 기존 방식
  const calculateBetAmount = (count) => {
    if (count <= 6) return 1;

    // 7~9: 2원, 10~12: 3원, 13~15: 4원, ...
    return 2 + Math.floor((count - 7) / 3);
  };

  // 지수 배팅액 계산 함수 - 수정: 선형 배팅액에서 1을 뺀 값으로 2의 지수 계산
  const calculateExpoBet = (betAmount) => {
    return Math.pow(2, betAmount - 1);
  };

  // 버튼 클릭 핸들러
  const handleNumberClick = (num) => {
    // 어떤 그룹에 속하는지 확인
    const groupIndex = Math.floor((num - 1) / 6);

    // 클릭한 그룹의 횟수는 0으로 초기화, 나머지 그룹은 +1
    const newCounts = betCounts.map((count, index) =>
      index === groupIndex ? 0 : count + 1
    );

    // 새로운 배팅액 계산
    const newAmounts = newCounts.map(calculateBetAmount);

    // 새로운 지수 배팅액 계산 - 선형 배팅액 기준으로 계산
    const newExpoBets = newAmounts.map(calculateExpoBet);

    // 클릭 이력 업데이트 (최대 10개까지만 저장)
    const newHistory = [num, ...clickHistory.slice(0, 9)];

    // 상태 업데이트
    setBetCounts(newCounts);
    setBetAmounts(newAmounts);
    setExpoBets(newExpoBets);
    setClickHistory(newHistory);
  };

  // 0 버튼 클릭 핸들러
  const handleZeroClick = () => {
    // 모든 그룹의 횟수 1씩 증가
    const newCounts = betCounts.map((count) => count + 1);

    // 새로운 배팅액 계산
    const newAmounts = newCounts.map(calculateBetAmount);

    // 새로운 지수 배팅액 계산 - 선형 배팅액 기준으로 계산
    const newExpoBets = newAmounts.map(calculateExpoBet);

    // 클릭 이력 업데이트 (최대 10개까지만 저장)
    const newHistory = [0, ...clickHistory.slice(0, 9)];

    // 상태 업데이트
    setBetCounts(newCounts);
    setBetAmounts(newAmounts);
    setExpoBets(newExpoBets);
    setClickHistory(newHistory);
  };

  // 이미지에 맞는 룰렛 숫자 배열 - 3행 12열로 배치
  const rouletteLayout = [
    // 첫 번째 행
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    // 두 번째 행
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    // 세 번째 행
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">룰렛 게임</h1>

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
                  num === 0 ? "bg-green-700 text-white" : getNumberColor(num)
                } ${index === 0 ? "ring-2 ring-yellow-400 ring-offset-2" : ""}`}
              >
                {num}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 배팅 상태 표시 */}
      <div className="mb-6 grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border p-2 rounded-md bg-gray-100">
            <p className="font-bold">
              {i * 6 + 1} ~ {(i + 1) * 6}
            </p>
            <p>카운트: {betCounts[i]}</p>
            <p>선형 배팅액: {betAmounts[i]}</p>
            <p className="font-bold text-red-600">지수 배팅액: {expoBets[i]}</p>
          </div>
        ))}
      </div>

      {/* 0 버튼 (모든 그룹 횟수 증가) */}
      <div className="mb-2">
        <Button
          onClick={handleZeroClick}
          className="w-24 h-12 bg-green-700 text-white font-bold text-xl rounded-none"
        >
          0
        </Button>
      </div>

      {/* 룰렛 보드 - 3행 12열 레이아웃 */}
      <div className="mb-6 border-2 border-green-800 inline-block">
        {rouletteLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((num) => (
              <Button
                key={num}
                onClick={() => handleNumberClick(num)}
                className={`w-12 h-12 m-0.5 font-bold text-xl ${getNumberColor(
                  num
                )} rounded-none ${
                  clickHistory[0] === num ? "ring-2 ring-yellow-400" : ""
                }`}
              >
                {num}
              </Button>
            ))}
          </div>
        ))}
      </div>

      {/* 룰렛 보드 설명 */}
      <div className="bg-gray-100 p-4 rounded-md">
        <h2 className="font-bold mb-2">게임 설명</h2>
        <ul className="list-disc pl-5">
          <li>
            각 숫자는 6개의 그룹으로 나뉩니다: 1~6, 7~12, 13~18, 19~24, 25~30,
            31~36
          </li>
          <li>
            숫자를 클릭하면, 해당 그룹의 카운트는 0이 되고 다른 그룹은 카운트가
            1 증가합니다.
          </li>
          <li>
            <strong>
              0 버튼을 클릭하면, 모든 그룹의 카운트가 1씩 증가합니다.
            </strong>
          </li>
          <li>배팅액은 두 가지 방식으로 계산됩니다:</li>
          <ul className="list-disc pl-5">
            <li>
              <strong>선형 배팅액:</strong> 카운트에 따라 선형적으로 증가
            </li>
            <ul>
              <li>1~6회: 1원</li>
              <li>7~9회: 2원</li>
              <li>10~12회: 3원</li>
              <li>13~15회: 4원</li>
              <li>이후 3회마다 1원씩 증가</li>
            </ul>
            <li className="text-red-600 mt-2">
              <strong>지수 배팅액:</strong> 2^(선형 배팅액-1)
            </li>
            <ul>
              <li>선형 배팅액 1: 2^0 = 1원</li>
              <li>선형 배팅액 2: 2^1 = 2원</li>
              <li>선형 배팅액 3: 2^2 = 4원</li>
              <li>선형 배팅액 4: 2^3 = 8원</li>
              <li>선형 배팅액 5: 2^4 = 16원</li>
            </ul>
          </ul>
        </ul>
      </div>
    </div>
  );
}
