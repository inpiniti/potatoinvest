"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { keyStore } from "@/store/keyStore";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // 뒤로가기 아이콘 추가

export default function Keys() {
  /**
   * 페이지 간 이동을 처리하기 위한 Next.js 라우터 객체
   * @type {import('next/navigation').AppRouterInstance}
   */
  const router = useRouter();

  /**
   * 사용자가 입력한 앱 키와 시크릿 키를 저장하는 상태 변수
   * @type {[Object, Function]} 키 정보 객체와 업데이트 함수
   * @property {string} appKey - App Key
   * @property {string} secretKey - Secret Key
   */
  const [keys, setKeys] = useState({
    appKey: "",
    secretKey: "",
  });

  /**
   * 입력된 키의 유효성 상태를 저장하는 변수
   * 앱 키와 시크릿 키가 모두 유효하면 true, 그렇지 않으면 false
   * @type {[boolean, Function]} 유효성 상태와 업데이트 함수
   */
  const [isValid, setIsValid] = useState(false);

  /**
   * 키 값을 저장소에 저장하는 함수
   * @type {Function} 키를 저장하는 함수
   */
  const { setKey } = keyStore();

  /**
   * 컴포넌트 마운트 시 저장된 키 정보를 불러옵니다.
   *
   * 저장된 키 정보가 있는 경우:
   * 1. 입력 필드에 키 정보를 설정합니다.
   * 2. 유효성을 검사하여 다음 버튼 활성화 여부를 결정합니다.
   *
   * 에러 발생 시 콘솔에 에러 메시지를 출력합니다.
   */
  useEffect(() => {
    try {
      /**
       * 저장된 키 정보를 담는 객체
       * @type {Object} 저장된 키 정보
       * @property {string} [appKey] - 저장된 App Key
       * @property {string} [secretKey] - 저장된 Secret Key
       */
      const savedKey = keyStore.getState().getKey();

      // 저장된 키 정보가 있으면 입력 필드에 설정
      const updatedKeys = {
        appKey: savedKey.appKey || "",
        secretKey: savedKey.secretKey || "",
      };

      setKeys(updatedKeys);

      // 앱 키와 시크릿 키 모두 있는 경우 유효함으로 설정
      setIsValid(
        updatedKeys.appKey.trim().length > 0 &&
          updatedKeys.secretKey.trim().length > 0
      );
    } catch (error) {
      console.error("키 정보 불러오기 실패:", error);
    }
  }, []);

  /**
   * 키 입력란의 변경 이벤트를 처리합니다.
   *
   * @param {string} field - 변경할 필드명 (appKey 또는 secretKey)
   * @returns {Function} 이벤트 핸들러 함수
   *
   * 동작:
   * 1. 입력 값을 상태에 저장합니다.
   * 2. 유효성 검사를 수행합니다. (모든 필드가 빈 값이 아닌지 확인)
   * 3. 유효성 검사 결과에 따라 버튼의 활성화 상태가 결정됩니다.
   */
  const handleKeyChange = (field) => (e) => {
    /**
     * 입력 필드에서 추출한 값
     * @type {string}
     */
    const value = e.target.value;

    /**
     * 업데이트된 키 정보
     * @type {Object}
     */
    const updatedKeys = { ...keys, [field]: value };

    setKeys(updatedKeys);

    // 앱 키와 시크릿 키 모두 입력되었는지 확인
    setIsValid(
      updatedKeys.appKey.trim().length > 0 &&
        updatedKeys.secretKey.trim().length > 0
    );
  };

  /**
   * 다음 버튼 클릭 이벤트를 처리합니다.
   *
   * 동작:
   * 1. 입력값이 유효하지 않으면 함수를 종료합니다.
   * 2. 앱 키와 시크릿 키를 암호화하여 keyStore에 저장합니다.
   * 3. 토큰 화면(/start/token)으로 이동합니다.
   */
  const handleSubmit = () => {
    if (!isValid) return;

    // 앱 키 암호화해서 저장
    setKey({
      filed: "appKey",
      appKey: keys.appKey,
    });

    // 시크릿 키 암호화해서 저장
    setKey({
      filed: "secretKey",
      secretKey: keys.secretKey,
    });

    // 토큰 화면으로 이동
    router.push("/start/token");
  };

  /**
   * 뒤로가기 버튼 클릭 이벤트를 처리합니다.
   *
   * 동작:
   * 계좌번호 입력 화면(/start/account)으로 이동합니다.
   */
  const handleBack = () => {
    router.push("/start/account");
  };

  return (
    // 최상위 컨테이너를 flex-col로 변경하고 중앙 정렬을 위한 클래스 추가
    <div className="flex flex-col items-center justify-center min-h-svh p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* 메인 콘텐츠 영역 - 중앙 정렬 */}
      <main className="flex flex-col gap-4 items-center w-full max-w-md">
        {/* 이미지 부분 */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg">
          <Image
            src="/images/key.jpg"
            alt="API 키 입력 아이콘"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-black">API 키 입력</h1>
        <div>
          <p className="text-neutral-600 text-center">
            한국투자증권 API 키를 입력해주세요.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col w-full max-w-md">
          {/* App Key 입력 필드 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full whitespace-nowrap items-center bg-neutral-100 p-4 rounded-lg">
              <label className="font-bold text-neutral-700">App Key</label>
              <input
                className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                value={keys.appKey}
                onChange={handleKeyChange("appKey")}
                placeholder="App Key를 입력해주세요"
              />
            </div>
          </div>

          {/* Secret Key 입력 필드 */}
          <div className="flex flex-col gap-2 w-full mt-2">
            <div className="flex gap-2 w-full whitespace-nowrap items-center bg-neutral-100 p-4 rounded-lg">
              <label className="font-bold text-neutral-700">Secret Key</label>
              <input
                className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                value={keys.secretKey}
                onChange={handleKeyChange("secretKey")}
                placeholder="Secret Key를 입력해주세요"
                type="password"
              />
            </div>
          </div>

          <p className="text-blue-400 pb-8 mt-4 text-sm">
            API 키가 없으신가요? 한국투자증권 홈페이지에서 발급받을 수 있습니다.
          </p>

          {/* 뒤로가기/다음 버튼 컨테이너 */}
          <div className="flex w-full justify-between">
            {/* 뒤로가기 버튼 - 모바일에서는 상단의 뒤로가기 버튼만 사용하기 위해 sm 이상에서만 표시 */}
            <button
              className="rounded-full border border-neutral-300 transition-colors flex items-center justify-center bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:flex"
              onClick={handleBack}
            >
              <FaArrowLeft className="mr-2" /> 뒤로
            </button>

            {/* 다음 버튼 - 유효성 검사 결과에 따라 스타일과 활성화 상태가 변경됨 */}
            <button
              className={`rounded-full border border-solid border-transparent transition-colors flex items-center justify-center ${
                isValid
                  ? "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] cursor-pointer"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              } font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:ml-auto`}
              onClick={handleSubmit}
              disabled={!isValid}
            >
              다음 <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
