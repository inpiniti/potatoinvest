import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { settingStore } from "@/store/settingStore";
import { toast } from "sonner";

const SettingsToggle = ({ children }) => {
  // children을 배열로 확인 (React.Children.toArray 사용)
  const childrenArray = React.Children.toArray(children);

  // 설정 값 상태
  const [settings, setSettings] = useState({
    minBuyAmount: 10000,
    minPredictRate: 70,
    sellPredictRate: 60,
    buyPredictRate: 60,
    sellRate: 2,
    buyRate: -10,
  });

  // 입력값 유효성 상태
  const [isValid, setIsValid] = useState(true);

  // settingStore에서 설정값 가져오기
  const { setSetting, setting } = settingStore();

  // 컴포넌트 마운트 시 저장된 설정 정보를 불러옵니다
  useEffect(() => {
    try {
      // 저장된 설정 정보가 있으면 입력 필드에 설정
      if (setting && setting.other) {
        const {
          minBuyAmount,
          minPredictRate,
          sellPredictRate,
          buyPredictRate,
          sellRate,
          buyRate,
        } = setting.other;
        setSettings({
          minBuyAmount: minBuyAmount || 10000,
          minPredictRate: minPredictRate || 70,
          sellPredictRate: sellPredictRate || 60,
          buyPredictRate: buyPredictRate || 60,
          sellRate: sellRate || 2,
          buyRate: buyRate || -10,
        });
      }
    } catch (error) {
      console.error("설정 정보 불러오기 실패:", error);
    }
  }, [setting]);

  // 입력란의 변경 이벤트를 처리
  const handleChange = (field) => (e) => {
    let value = e.target.value;

    // 빈 값은 0으로 처리
    if (value === "") {
      value = "0";
    }

    // 숫자로 변환
    const numValue = parseFloat(value);

    // 설정 업데이트
    const updatedSettings = { ...settings, [field]: numValue };
    setSettings(updatedSettings);

    // 유효성 검사
    validateSettings(updatedSettings);
  };

  // 설정 값의 유효성을 검사
  const validateSettings = (updatedSettings) => {
    const {
      minBuyAmount,
      minPredictRate,
      sellPredictRate,
      buyPredictRate,
      sellRate,
      buyRate,
    } = updatedSettings;

    const isValidAmount = !isNaN(minBuyAmount) && minBuyAmount >= 1000;
    const isValidPredictRate =
      !isNaN(minPredictRate) && minPredictRate >= 0 && minPredictRate <= 100;
    const isValidSellPredictRate =
      !isNaN(sellPredictRate) && sellPredictRate >= 0 && sellPredictRate <= 100;
    const isValidBuyPredictRate =
      !isNaN(buyPredictRate) && buyPredictRate >= 0 && buyPredictRate <= 100;
    const isValidSellRate = !isNaN(sellRate) && sellRate > 0;
    const isValidBuyRate = !isNaN(buyRate) && buyRate < 0;

    setIsValid(
      isValidAmount &&
        isValidPredictRate &&
        isValidSellPredictRate &&
        isValidBuyPredictRate &&
        isValidSellRate &&
        isValidBuyRate
    );
  };

  // 설정 저장 핸들러
  const handleSave = () => {
    if (!isValid) return;

    // 설정 저장
    setSetting({
      other: {
        minBuyAmount: settings.minBuyAmount,
        minPredictRate: settings.minPredictRate,
        sellPredictRate: settings.sellPredictRate,
        buyPredictRate: settings.buyPredictRate,
        sellRate: settings.sellRate,
        buyRate: settings.buyRate,
      },
    });

    // alert 대신 Sonner 토스트 사용
    toast.success("설정이 저장되었습니다", {
      description: "변경된 설정이 적용되었습니다.",
      duration: 3000,
      position: "top-center",
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings size={16} />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-md">
                <DrawerHeader>
                  <DrawerTitle>설정</DrawerTitle>
                  <DrawerDescription>
                    여기서 설정한 옵션값을 기준으로 구매 및 매도가 됩니다.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0">
                  {/* 설정 내용 표시 - 쿠키 설정 스타일로 */}
                  <div className="space-y-6">
                    {/* Strictly Necessary */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium">자동 선택</h4>
                        <p className="text-xs text-muted-foreground">
                          3초마다 다음 종목이 선택됩니다.
                        </p>
                      </div>
                      {childrenArray[0] || <div className="h-6 w-10"></div>}
                    </div>

                    {/* Functional Cookies */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium">자동 매수</h4>
                        <p className="text-xs text-muted-foreground">
                          분석된 데이터 및 보유종목중 손실률 10%이하인 종목을
                          자동으로 매수합니다.
                        </p>
                      </div>
                      {childrenArray[1] || <div className="h-6 w-10"></div>}
                    </div>

                    {/* Performance Cookies */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium">자동 매도</h4>
                        <p className="text-xs text-muted-foreground">
                          수익률이 2%이상인 종목은 자동으로 매도합니다.
                        </p>
                      </div>
                      {childrenArray[2] || <div className="h-6 w-10"></div>}
                    </div>

                    {/* 최소매수금액 입력 필드 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        최소매수금액 (원)
                      </label>
                      <div className="flex gap-2 w-full items-center bg-neutral-100 p-2 rounded-lg">
                        <input
                          type="number"
                          className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                          value={settings.minBuyAmount}
                          onChange={handleChange("minBuyAmount")}
                          placeholder="최소매수금액을 입력해주세요"
                          min="1000"
                        />
                        <span className="text-neutral-500">원</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        최소 매수 금액을 설정합니다. (최소 1,000원)
                      </p>
                    </div>

                    {/* 매도기준 입력 필드 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        매도기준 (%)
                      </label>
                      <div className="flex gap-2 w-full items-center bg-neutral-100 p-2 rounded-lg">
                        <input
                          type="number"
                          className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                          value={settings.sellRate}
                          onChange={handleChange("sellRate")}
                          placeholder="매도기준을 입력해주세요"
                          min="0.1"
                          step="0.1"
                        />
                        <span className="text-neutral-500">%</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        양수 값을 입력해주세요. 예: 2.0은 2% 수익 시 매도
                      </p>
                    </div>

                    {/* 매수기준 입력 필드 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">
                        매수기준 (%)
                      </label>
                      <div className="flex gap-2 w-full items-center bg-neutral-100 p-2 rounded-lg">
                        <input
                          type="number"
                          className="flex-1 border-0 shadow-none focus:outline-none focus:ring-0 bg-neutral-100"
                          value={settings.buyRate}
                          onChange={handleChange("buyRate")}
                          placeholder="매수기준을 입력해주세요"
                          max="-0.1"
                          step="0.1"
                        />
                        <span className="text-neutral-500">%</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        음수 값을 입력해주세요. 예: -10은 10% 하락 시 매수
                      </p>
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <Button className="w-full" onClick={handleSave}>
                    저장
                  </Button>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </TooltipTrigger>
        <TooltipContent>
          <p>설정값 확인</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SettingsToggle;
