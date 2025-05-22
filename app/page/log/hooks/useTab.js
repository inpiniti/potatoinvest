import { useRef, useState } from "react";

const useTab = () => {
  const [activeTab, setActiveTab] = useState("분석");
  const activeTabRef = useRef(activeTab); // useRef로 activeTab 복사

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    activeTabRef.current = newTab; // useRef를 즉시 업데이트
  };

  return {
    activeTab,
    setActiveTab,
    activeTabRef,
    handleTabChange,
  };
};

export default useTab;
