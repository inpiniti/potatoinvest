import Image from 'next/image';

export default function Account() {
  return (
    <div className="flex items-center justify-items-center min-h-svh p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-center sm:items-start">
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
          <div className="flex gap-2 w-full whitespace-nowrap items-center bg-neutral-100 p-4 rounded-lg">
            계좌번호{' '}
            <input
              className="border-0 shadow-none focus:outline-none focus:ring-0"
              tabIndex={-1}
            />
          </div>
          <p className="text-blue-400 pb-8">
            계좌번호가 없습니까? 가장간단한 방법은 스마트폰으로 비대면
            계좌개설을 하는 것입니다. 유의할 점은 신분증과 본인명의의 휴대폰이
            필요합니다.
          </p>
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/page/log"
            rel="noopener noreferrer"
          >
            다음 &nbsp; &nbsp; &nbsp; &nbsp; &gt;
          </a>
        </div>
      </main>
    </div>
  );
}
