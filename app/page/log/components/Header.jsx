import NavigationHeader from "./header/NavigationHeader";

const Header = ({ children }) => {
  return (
    <div className="space-y-2">
      {/* 상단 네비게이션 헤더 */}
      <NavigationHeader>{children}</NavigationHeader>
    </div>
  );
};

export default Header;
