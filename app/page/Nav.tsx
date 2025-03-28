import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navList = [
  // {
  //   name: '실시간 데이터',
  //   path: '/realtime',
  //   href: '/page/realtime',
  // },
  {
    name: '구매내역',
    path: '/buy',
    href: '/page/buy',
  },
  {
    name: '판매내역',
    path: '/sell',
    href: '/page/sell',
  },
  {
    name: '자동매매',
    path: '/log',
    href: '/page/log',
  },
  // {
  //   name: '자산',
  //   path: '/money',
  //   href: '/page/money',
  // },

  // {
  //   name: '패치노트',
  //   path: '/patchNotes',
  //   href: '/page/patchNotes',
  // },
  {
    name: 'API',
    path: '/api',
    href: '/page/api',
  },
  // {
  //   name: '개발노트',
  //   path: '/note',
  //   href: '/page/note',
  // },
  // {
  //   name: '이슈',
  //   path: '/issue',
  //   href: '/page/issue',
  // },
  {
    name: '설정',
    path: '/setting',
    href: '/page/setting',
  },
];

const Nav = () => {
  const pathname = usePathname();
  const getLinkClass = (path: string) =>
    pathname.includes(path)
      ? 'cursor-pointer px-2 py-1 font-bold hover:bg-neutral-100 rounded-md underline underline-offset-10 decoration-2'
      : 'cursor-pointer px-2 py-1 hover:font-bold hover:bg-neutral-100 rounded-md';

  return (
    <nav className="container mx-auto pb-0.5 overflow-x-auto px-2">
      <ul className="flex gap-1 whitespace-nowrap flex-nowrap">
        {navList.map((nav) => (
          <Link key={nav.path} href={nav.href}>
            <li className={getLinkClass(nav.path)}>{nav.name}</li>
          </Link>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;
