import { Carousel, CarouselContent } from "@/components/ui/carousel";
import { useEffect, useRef, useState } from "react";

const SectionTitle = ({ children, current, setCurrent, analysisData }) => {
  const [api, setApi] = useState();
  // 현재 선택된 인덱스 추적
  const [currentIndex, setCurrentIndex] = useState(0);
  // 이벤트 핸들러 참조를 저장할 ref 추가
  const selectHandlerRef = useRef(undefined);

  // 첫 번째 effect: 캐러셀 API 초기화 및 이벤트 리스너 설정
  useEffect(() => {
    if (!api) return;

    // 슬라이드 변경 시 현재 메일 업데이트
    const selectHandler = () => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrentIndex(selectedIndex);
      setCurrent(selectedIndex);
    };

    // 참조에 핸들러 저장 (두 번째 effect에서 사용)
    selectHandlerRef.current = selectHandler;

    // 이벤트 리스너 등록
    api.on("select", selectHandler);

    // 초기 설정 (첫 번째 슬라이드로 이동)
    api.scrollTo(0);

    // 클린업 함수
    return () => {
      api.off("select", selectHandler);
      selectHandlerRef.current = undefined;
    };
  }, [api, analysisData]);

  // 두 번째 effect: currentMail이 변경될 때 캐러셀 위치 업데이트
  useEffect(() => {
    if (!api || current === undefined || current === null) return;

    // const mailIndex = analysisData.findIndex(
    //   (analysis) => analysis.name === current.name
    // );

    // 저장한 핸들러 참조 사용
    const handler = selectHandlerRef.current;

    // 핸들러가 있으면 임시로 제거
    if (handler) {
      api.off("select", handler);
    }

    // 캐러셀 위치 업데이트
    api.scrollTo(current);
    setCurrentIndex(current);

    // 핸들러 다시 등록
    if (handler) {
      setTimeout(() => {
        api.on("select", handler);
      }, 0);
    }
  }, [current, analysisData, api, currentIndex]);

  return (
    <div className="shrink-0">
      <Carousel setApi={setApi}>
        <CarouselContent>{children}</CarouselContent>
      </Carousel>
    </div>
  );
};
export default SectionTitle;
