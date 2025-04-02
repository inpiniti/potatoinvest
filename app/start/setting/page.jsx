"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { settingStore } from "@/store/settingStore";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // 화살표 아이콘 추가

export default function Setting() {
  /**
   * 페이지 간 이동을 처리하기 위한 Next.js 라우터 객체
   * @type {import('next/navigation').AppRouterInstance}
   */
  const router = useRouter();

  /**
   * 사용자 설정 값을 저장하는 상태 변수
   * @type {[Object, Function]} 설정 값 객체와 업데이트 함수
   * @property {number} minBuyAmount - 최소매수금액
   * @property {number} minPredictRate - 최소예측률
   * @property {number} sellRate - 매도기준(%)
   * @property {number} buyRate - 매수기준(%)
   */
  const [settings, setSettings] = useState({
    minBuyAmount: 10000,
    minPredictRate: 70,
    sellRate: 2,
    buyRate: -10,
  });

  /**
   * 입력된 설정 값의 유효성 상태를 저장하는 변수
   * 모든 필드가 유효하면 true, 그렇지 않으면 false
   * @type {[boolean, Function]} 유효성 상태와 업데이트 함수
   */
  const [isValid, setIsValid] = useState(true);

  /**
   * 설정 값을 저장소에 저장하는 함수
   * @type {Function} 설정을 저장하는 함수
   */
  const { setSetting, setting } = settingStore();

  /**
   * 컴포넌트 마운트 시 저장된 설정 정보를 불러옵니다.
   *
   * 저장된 설정 정보가 있는 경우:
   * 1. 입력 필드에 설정 정보를 설정합니다.
   * 2. 유효성을 검사하여 다음 버튼 활성화 여부를 결정합니다.
   *
   * 에러 발생 시 콘솔에 에러 메시지를 출력합니다.
   */
  useEffect(() => {
    try {
      // 저장된 설정 정보가 있으면 입력 필드에 설정
      if (setting && setting.other) {
        const { minBuyAmount, minPredictRate, sellRate, buyRate } =
          setting.other;
        setSettings({
          minBuyAmount: minBuyAmount || 10000,
          minPredictRate: minPredictRate || 70,
          sellRate: sellRate || 2,
          buyRate: buyRate || -10,
        });
      }
    } catch (error) {
      console.error("설정 정보 불러오기 실패:", error);
    }
  }, [setting]);

  /**
   * 입력란의 변경 이벤트를 처리합니다.
   *
   * @param {string} field - 변경할 필드명
   * @returns {Function} 이벤트 핸들러 함수
   *
   * 동작:
   * 1. 입력 값을 파싱하여 숫자로 변환합니다.
   * 2. 상태에 업데이트된 값을 저장합니다.
   * 3. 유효성 검사를 수행합니다.
   * 4. 유효성 검사 결과에 따라 버튼의 활성화 상태가 결정됩니다.
   */
  const handleChange = (field) => (e) => {
    let value = e.target.value;

    // 빈 값은 0으로 처리
    if (value === "") {
      value = "0";
    }

    // 숫자로 변환
    const numValue = parseFloat(value);

    // 설정 업데이트
    const updatedSettings = { ...settings, [field]: numValue };
    setSettings(updatedSettings);

    // 유효성 검사
    validateSettings(updatedSettings);
  };

  /**
   * 설정 값의 유효성을 검사합니다.
   *
   * @param {Object} updatedSettings - 검사할 설정 값
   *
   * 검사 조건:
   * 1. 최소매수금액: 1000원 이상
   * 2. 최소예측률: 0~100% 사이
   * 3. 매도기준: 양수
   * 4. 매수기준: 음수
   */
  const validateSettings = (updatedSettings) => {
    const { minBuyAmount, minPredictRate, sellRate, buyRate } = updatedSettings;

    const isValidAmount = !isNaN(minBuyAmount) && minBuyAmount >= 1000;
    const isValidPredictRate =
      !isNaN(minPredictRate) && minPredictRate >= 0 && minPredictRate <= 100;
    const isValidSellRate = !isNaN(sellRate) && sellRate > 0;
    const isValidBuyRate = !isNaN(buyRate) && buyRate < 0;

    setIsValid(
      isValidAmount && isValidPredictRate && isValidSellRate && isValidBuyRate
    );
  };

  /**
   * 완료 버튼 클릭 이벤트를 처리합니다.
   *
   * 동작:
   * 1. 입력값이 유효하지 않으면 함수를 종료합니다.
   * 2. 설정 값을 settingStore에 저장합니다.
   * 3. 메인 대시보드 화면으로 이동합니다.
   */
  const handleSubmit = () => {
    if (!isValid) return;

    // 설정 저장
    setSetting({
      other: {
        minBuyAmount: settings.minBuyAmount,
        minPredictRate: settings.minPredictRate,
        sellRate: settings.sellRate,
        buyRate: settings.buyRate,
      },
    });

    // 메인 대시보드로 이동
    router.push("/page/sell");
  };

  /**
   * 뒤로가기 버튼 클릭 이벤트를 처리합니다.
   *
   * 동작:
   * 이전 화면(토큰 발급 화면)으로 이동합니다.
   */
  const handleBack = () => {
    router.push("/start/token");
  };

  return (
    // 최상위 컨테이너를 flex-col로 변경하고 중앙 정렬을 위한 클래스 추가
    <div className="flex flex-col items-center justify-center min-h-svh p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* 메인 콘텐츠 영역 - 중앙 정렬 */}
      <main className="flex flex-col gap-4 items-center w-full max-w-md">
        <h1 className="text-3xl font-bold text-black">자동매매 설정</h1>
        <div>
          <p className="text-neutral-600 text-center">
            자동매매에 필요한 설정을 입력해주세요.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col w-full max-w-md">
          {/* 최소매수금액 입력 필드 */}
          <div className="flex flex-col gap-2 w-full mt-4">
            <label className="font-medium text-neutral-700">
              최소매수금액 (원)
            </label>
            <div className="flex gap-2 w-full whitespace-nowrap items-center bg-neutral-100 p-4 rounded-lg">
              <input
                type="number"
                className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                value={settings.minBuyAmount}
                onChange={handleChange("minBuyAmount")}
                placeholder="최소매수금액을 입력해주세요"
                min="1000"
              />
              <span className="text-neutral-500">원</span>
            </div>
            <p className="text-xs text-neutral-500">
              최소 1,000원 이상 입력해주세요.
            </p>
          </div>

          {/* 최소예측률 입력 필드 */}
          <div className="flex flex-col gap-2 w-full mt-4">
            <label className="font-medium text-neutral-700">
              최소예측률 (%)
            </label>
            <div className="flex gap-2 w-full whitespace-nowrap items-center bg-neutral-100 p-4 rounded-lg">
              <input
                type="number"
                className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                value={settings.minPredictRate}
                onChange={handleChange("minPredictRate")}
                placeholder="최소예측률을 입력해주세요"
                min="0"
                max="100"
              />
              <span className="text-neutral-500">%</span>
            </div>
            <p className="text-xs text-neutral-500">
              0~100% 사이의 값을 입력해주세요.
            </p>
          </div>

          {/* 매도기준 입력 필드 */}
          <div className="flex flex-col gap-2 w-full mt-4">
            <label className="font-medium text-neutral-700">매도기준 (%)</label>
            <div className="flex gap-2 w-full whitespace-nowrap items-center bg-neutral-100 p-4 rounded-lg">
              <input
                type="number"
                className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                value={settings.sellRate}
                onChange={handleChange("sellRate")}
                placeholder="매도기준을 입력해주세요"
                min="0.1"
                step="0.1"
              />
              <span className="text-neutral-500">%</span>
            </div>
            <p className="text-xs text-neutral-500">
              양수 값을 입력해주세요. 예: 2.0은 2% 수익 시 매도
            </p>
          </div>

          {/* 매수기준 입력 필드 */}
          <div className="flex flex-col gap-2 w-full mt-4">
            <label className="font-medium text-neutral-700">매수기준 (%)</label>
            <div className="flex gap-2 w-full whitespace-nowrap items-center bg-neutral-100 p-4 rounded-lg">
              <input
                type="number"
                className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                value={settings.buyRate}
                onChange={handleChange("buyRate")}
                placeholder="매수기준을 입력해주세요"
                max="-0.1"
                step="0.1"
              />
              <span className="text-neutral-500">%</span>
            </div>
            <p className="text-xs text-neutral-500">
              음수 값을 입력해주세요. 예: -10은 10% 하락 시 매수
            </p>
          </div>

          {/* 뒤로가기/완료 버튼 컨테이너 */}
          <div className="flex w-full justify-between mt-8">
            {/* 뒤로가기 버튼 */}
            <button
              className="rounded-full border border-neutral-300 transition-colors flex items-center justify-center bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              onClick={handleBack}
            >
              <FaArrowLeft className="mr-2" /> 뒤로
            </button>

            {/* 완료 버튼 - 유효성 검사 결과에 따라 스타일과 활성화 상태가 변경됨 */}
            <button
              className={`rounded-full border border-solid border-transparent transition-colors flex items-center justify-center ${
                isValid
                  ? "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] cursor-pointer"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              } font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5`}
              onClick={handleSubmit}
              disabled={!isValid}
            >
              완료 <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
