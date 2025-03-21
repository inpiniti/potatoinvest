import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navList = [
  {
    name: '종합정보',
    path: '/overview',
    href: '/stock/overview',
  },
  {
    name: '시세',
    path: '/sise',
    href: '/stock/sise',
  },
  {
    name: '차트',
    path: '/chart',
    href: '/stock/chart',
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
