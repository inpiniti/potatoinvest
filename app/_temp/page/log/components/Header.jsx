import React from "react";
import NavigationHeader from "./header/NavigationHeader";

const Header = ({ children }) => {
  // children을 배열로 확인 (React.Children.toArray 사용)
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="space-y-2">
      {/* 상단 네비게이션 헤더 */}
      <NavigationHeader>
        {childrenArray[0]}
        <div className="flex gap-2 items-center">
          {childrenArray[1]}
          {childrenArray[2]}
        </div>
      </NavigationHeader>
    </div>
  );
};

export default Header;
