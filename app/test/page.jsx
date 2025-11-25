'use client';

const Button = ({ children }) => {
  return (
    <button className="hover:bg-neutral-700 px-2 py-1 rounded cursor-pointer">
      {children}
    </button>
  );
};

const Section = ({ children, title }) => {
  return (
    <div className="border border-accent-foreground cursor-pointer flex-1">
      <div className="font-bold">{title}</div>
      {children}
    </div>
  );
};

const Input = ({ label, value }) => {
  return (
    <div className="w-full flex flex-col">
      {label}
      <input
        className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 w-32 text-neutral-100 focus:outline-none focus:border-neutral-500"
        value={value}
      />
    </div>
  );
};

const Stcok = ({ children }) => {
  return (
    <div className="p-2 bg-neutral-900 rounded cursor-pointer">{children}</div>
  );
};

const TestPage = () => {
  return (
    <div className="bg-neutral-900 text-neutral-100 text-xs h-svh w-full flex flex-col divide-y divide-neutral-700">
      <header className="flex items-center space-x-2 p-2 shrink-0">
        <logo className="text-rose-200">Potato Invest</logo>
        <Button>File</Button>
        <Button>Edit</Button>
        <Button>Selection</Button>
        <Button>View</Button>
        <Button>Go</Button>
        <Button>Run</Button>
        <Button>Terminal</Button>
        <Button>Help</Button>
      </header>
      <div className="flex divide-x divide-neutral-700 h-full">
        <aside className="flex flex-col divide-y divide-neutral-700 w-36 shrink-0">
          <section>
            <Input label="계좌" value="sdfadsf" />
            <Section title="시크릿">dsf</Section>
            <Section title="token">asdfsdaf</Section>
          </section>
          <div className="grid grid-cols-2">
            <Section title="어제수익">5만원</Section>
            <Section title="오늘수익">3만원</Section>
            <Section title="총자산">100만원</Section>
            <Section title="투자액수">80만원</Section>
          </div>
          <section>
            <Section title="200일 이평선">200</Section>
            <Section title="RSI">30</Section>
            <Section title="BB">하단</Section>
            <Section title="f-score"></Section>
          </section>
          <Section title="환율">1458원</Section>
        </aside>
        <main className="w-full bg-neutral-800 divide-y divide-neutral-700">
          <section className="p-2 flex gap-2 items-center">
            구매내역
            <div className="flex gap-2">
              <Stcok>MSIS</Stcok>
              <Stcok>AAPL</Stcok>
            </div>
          </section>
          <section className="p-2 flex gap-2 items-center">
            매수추천
            <div className="flex gap-2">
              <Stcok>MSIS</Stcok>
              <Stcok>AAPL</Stcok>
            </div>
          </section>
          <section className="p-2 flex gap-2 items-center">
            매도추천
            <div className="flex gap-2">
              <Stcok>MSIS</Stcok>
              <Stcok>AAPL</Stcok>
            </div>
          </section>
          <section className="p-2 flex flex-col gap-2">
            AAPL
            <figure className="bg-neutral-900 h-48 rounded border border-neutral-950"></figure>
          </section>
        </main>
        <aside className="flex flex-col divide-y divide-neutral-800 w-48 shrink-0">
          <section>
            <tabs>
              <tab>뉴스</tab>
              <tab>커뮤니티</tab>
            </tabs>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default TestPage;
