"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { keyStore } from "@/store/keyStore";

export default function Account() {
  /**
   * 페이지 간 이동을 처리하기 위한 Next.js 라우터 객체
   * @type {import('next/navigation').AppRouterInstance}
   */
  const router = useRouter();

  /**
   * 사용자가 입력한 계좌번호를 저장하는 상태 변수
   * @type {[string, Function]} 계좌번호 문자열과 업데이트 함수
   */
  const [account, setAccount] = useState("");

  /**
   * 입력된 계좌번호의 유효성 상태를 저장하는 변수
   * 계좌번호가 유효하면 true, 그렇지 않으면 false
   * @type {[boolean, Function]} 유효성 상태와 업데이트 함수
   */
  const [isValid, setIsValid] = useState(false);

  /**
   * 키 값을 저장소에 저장하는 함수
   * @type {Function} 키를 저장하는 함수
   */
  const { setKey } = keyStore();

  /**
   * 컴포넌트 마운트 시 저장된 계좌번호를 불러옵니다.
   *
   * 저장된 계좌번호가 있는 경우:
   * 1. 입력 필드에 계좌번호를 설정합니다.
   * 2. 입력값이 유효하다고 표시합니다.
   *
   * 에러 발생 시 콘솔에 에러 메시지를 출력합니다.
   */
  useEffect(() => {
    try {
      /**
       * 저장된 키 정보를 담는 객체
       * @type {Object} 저장된 키 정보
       * @property {string} [account] - 저장된 계좌번호
       */
      const savedKey = keyStore.getState().getKey();
      if (savedKey.account) {
        setAccount(savedKey.account);
        setIsValid(true);
      }
    } catch (error) {
      console.error("계좌정보 불러오기 실패:", error);
    }
  }, []);

  /**
   * 계좌번호 입력란의 변경 이벤트를 처리합니다.
   *
   * @param {Object} e - 이벤트 객체
   * @param {string} e.target.value - 입력된 계좌번호 값
   *
   * 동작:
   * 1. 입력 값을 상태에 저장합니다.
   * 2. 유효성 검사를 수행합니다. (현재는 빈 값이 아닌지만 확인)
   * 3. 유효성 검사 결과에 따라 버튼의 활성화 상태가 결정됩니다.
   */
  const handleAccountChange = (e) => {
    /**
     * 입력 필드에서 추출한 계좌번호 값
     * @type {string}
     */
    const value = e.target.value;
    setAccount(value);
    setIsValid(value.trim().length > 0);
  };

  /**
   * 다음 버튼 클릭 이벤트를 처리합니다.
   *
   * 동작:
   * 1. 입력값이 유효하지 않으면 함수를 종료합니다.
   * 2. 계좌번호를 암호화하여 keyStore에 저장합니다.
   *    - filed: "account" 필드에 저장
   *    - account: 입력된 계좌번호 값
   * 3. 키 입력 화면(/start/keys)으로 이동합니다.
   */
  const handleSubmit = () => {
    if (!isValid) return;

    // 계좌번호 암호화해서 저장
    setKey({
      filed: "account",
      account: account,
    });

    // 키 입력 화면으로 이동
    router.push("/start/keys");
  };

  return (
    // 최상위 컨테이너를 flex-col로 변경하고 중앙 정렬을 위한 클래스 추가
    <div className="flex flex-col items-center justify-center min-h-svh p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* 메인 콘텐츠 영역 - 중앙 정렬 */}
      <main className="flex flex-col gap-4 items-center w-full max-w-md">
        {/* 이미지 부분 */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg">
          <Image
            src="/images/account.webp"
            alt="계좌 입력 아이콘"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <h1 className="text-3xl font-bold text-black">계좌입력</h1>
        <div>
          <p className="text-neutral-600">
            한국투자증권의 계좌를 입력해주세요.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col">
          {/* 계좌번호 입력 필드 */}
          <div className="flex gap-2 w-full whitespace-nowrap items-center bg-neutral-100 p-4 rounded-lg">
            계좌번호{" "}
            <input
              className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
              value={account}
              onChange={handleAccountChange}
              placeholder="계좌번호를 입력해주세요"
            />
          </div>
          <p className="text-blue-400 pb-8">
            계좌번호가 없습니까? 가장간단한 방법은 스마트폰으로 비대면
            계좌개설을 하는 것입니다. 유의할 점은 신분증과 본인명의의 휴대폰이
            필요합니다.
          </p>
          {/* 다음 버튼 - 유효성 검사 결과에 따라 스타일과 활성화 상태가 변경됨 */}
          <button
            className={`rounded-full border border-solid border-transparent transition-colors flex items-center justify-center ${
              isValid
                ? "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] cursor-pointer"
                : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
            } font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto`}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            다음 &nbsp; &nbsp; &nbsp; &nbsp; &gt;
          </button>
        </div>
      </main>
    </div>
  );
}
