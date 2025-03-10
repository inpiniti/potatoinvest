import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Nav = () => {
  const pathname = usePathname();
  const getLinkClass = (path: string) =>
    pathname.includes(path)
      ? 'underline underline-offset-8 decoration-4 font-bold cursor-pointer'
      : 'cursor-pointer hover:underline hover:underline-offset-8 hover:decoration-4 hover:font-bold';

  return (
    <nav className="container mx-auto px-2 sm:px-2 md:px-3 lg:px-4 pb-1.5 overflow-x-auto">
      <ul className="flex gap-2 sm:gap-2 md:gap-3 lg:gap-4 whitespace-nowrap flex-nowrap">
        <li className={getLinkClass('/realtime')}>
          <Link href="/page/realtime">실시간 데이터</Link>
        </li>
        <li className={getLinkClass('/buy')}>
          <Link href="/page/buy">구매내역</Link>
        </li>
        <li className={getLinkClass('/sell')}>
          <Link href="/page/sell">판매내역</Link>
        </li>
        <li className={getLinkClass('/log')}>
          <Link href="/page/log">자동매매</Link>
        </li>
        <li className={getLinkClass('/money')}>
          <Link href="/page/money">자산</Link>
        </li>
        <li className={getLinkClass('/setting')}>
          <Link href="/page/setting">설정</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
