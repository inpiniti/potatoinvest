import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Nav = () => {
  const pathname = usePathname();
  const getLinkClass = (path: string) =>
    pathname.includes(path)
      ? 'cursor-pointer px-2 py-1 font-bold hover:bg-neutral-100 rounded-md underline underline-offset-10 decoration-2'
      : 'cursor-pointer px-2 py-1 hover:font-bold hover:bg-neutral-100 rounded-md';

  return (
    <nav className="container mx-auto pb-0.5 overflow-x-auto px-2">
      <ul className="flex gap-1 whitespace-nowrap flex-nowrap">
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
        <li className={getLinkClass('/patchNotes')}>
          <Link href="/page/patchNotes">패치노트</Link>
        </li>
        <li className={getLinkClass('/note')}>
          <Link href="/page/note">개발노트</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
