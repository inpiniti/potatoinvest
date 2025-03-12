import { FaUser } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-svh p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-5xl font-bold">감자증권</h1>
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="tracking-[-.01em]">
            Ai를 활용하여 주식을 예측하세요.
          </li>
          <li className="tracking-[-.01em]">
            자동으로 주식을 매매하고 수익을 올리세요.
          </li>
          <li className="tracking-[-.01em]">지금 바로 시작하세요.</li>
        </ol>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/page/buy"
            rel="noopener noreferrer"
          >
            Start &nbsp; &nbsp; &nbsp; &nbsp; &gt;
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-xs"
          href="https://career.programmers.co.kr/pr/155474_498"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaUser size={16} />
          Made by Young Kyung
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-xs"
          href="mailto:younginpiniti@google.com"
        >
          <MdAlternateEmail size={16} />
          younginpiniti@google.com
        </a>
      </footer>
    </div>
  );
}
