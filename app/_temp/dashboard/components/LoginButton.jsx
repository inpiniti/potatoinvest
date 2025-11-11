"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { keyStore } from "@/store/keyStore";
import { tempKeyStore } from "@/store/tempKeyStore";
import useToken from "@/hooks/useToken";
import dayjs from "dayjs";

import {
  KeyRound, // 로그인 아이콘
} from "lucide-react";

const LoginButton = () => {
  // 입력값 상태 관리
  const [inputs, setInputs] = useState({
    account: "",
    appKey: "",
    secretKey: "",
  });

  // 토큰 발급 상태 관리
  const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * 저장된 키 정보를 담는 객체
   */
  const { key, setKey, getKey } = keyStore();

  /**
   * 발급된 토큰 정보를 담는 객체
   */
  const { key: tempKey, realKey } = tempKeyStore();

  /**
   * 토큰 발급 및 확인 관련 함수
   */
  const { 토큰발급, 발급된토큰확인 } = useToken();

  // 컴포넌트 마운트 시 저장된 키 정보 불러오기
  useEffect(() => {
    try {
      const savedKeys = getKey();
      setInputs({
        account: savedKeys.account || "",
        appKey: savedKeys.appKey || "",
        secretKey: savedKeys.secretKey || "",
      });
    } catch (error) {
      console.error("저장된 키 정보를 불러오는 중 오류:", error);
      // 오류 발생 시 기본값으로 초기화
      setInputs({
        account: "",
        appKey: "",
        secretKey: "",
      });
    }
  }, [getKey]);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 키 저장 핸들러
  const saveKeys = () => {
    try {
      // 각 필드별로 저장
      setKey({ filed: "account", account: inputs.account });
      setKey({ filed: "appKey", appKey: inputs.appKey });
      setKey({ filed: "secretKey", secretKey: inputs.secretKey });

      console.log("키 정보가 저장되었습니다.");
    } catch (error) {
      console.error("키 저장 중 오류:", error);
      setErrorMessage("키 정보 저장에 실패했습니다.");
    }
  };

  /**
   * 토큰을 발급하는 함수
   */
  const issueToken = async () => {
    try {
      // 필수 정보가 설정되어 있는지 확인
      if (!inputs.account || !inputs.appKey || !inputs.secretKey) {
        setStatus("error");
        setErrorMessage(
          "계좌번호, App Key, Secret Key가 모두 설정되어 있어야 합니다."
        );
        return;
      }

      // 먼저 키 정보 저장
      saveKeys();

      setStatus("loading");

      // 이미 발급된 토큰이 있는지 확인
      const hasToken = await 발급된토큰확인();

      if (hasToken) {
        // 토큰이 있는 경우 유효기간 확인
        const tokenInfo = key.isVts ? tempKey : realKey;
        const expiryDate = tokenInfo?.access_token_token_expired;

        if (expiryDate) {
          const expiry = dayjs(expiryDate);
          const now = dayjs();

          // 토큰이 유효한 경우 (만료 시간이 현재보다 나중)
          if (expiry.isAfter(now)) {
            setStatus("success");
            return;
          }
          // 토큰이 만료된 경우
          console.log("토큰이 만료되어 재발급을 시도합니다.");
        }
      }

      // 토큰이 없거나 만료된 경우 새로 발급 시도
      const result = await 토큰발급();

      if (result) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(
          "토큰 발급에 실패했습니다. 입력한 정보를 확인해주세요."
        );
      }
    } catch (error) {
      console.error("토큰 발급 중 오류:", error);
      setStatus("error");
      setErrorMessage(error.message || "토큰 발급 중 오류가 발생했습니다.");
    }
  };

  // 상태에 따른 버튼 텍스트 및 스타일 설정
  const getButtonProps = () => {
    switch (status) {
      case "loading":
        return { text: "처리 중...", disabled: true };
      case "success":
        return { text: "토큰 발급 완료", variant: "success" };
      case "error":
        return { text: "다시 시도", variant: "destructive" };
      default:
        return { text: "토큰 발급", variant: "default" };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7">
          <KeyRound className={status === "success" ? "text-green-500" : ""} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>로그인</DialogTitle>
          <DialogDescription>
            한국투자증권의 계좌번호와 앱 키, 시크릿 키를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="account">한국투자증권 계좌번호</Label>
            <Input
              id="account"
              name="account"
              value={inputs.account}
              onChange={handleInputChange}
              placeholder="00000000-00"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="appKey">앱 키</Label>
            <Input
              id="appKey"
              name="appKey"
              value={inputs.appKey}
              onChange={handleInputChange}
              placeholder="앱 키를 입력하세요"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="secretKey">시크릿 키</Label>
            <Input
              id="secretKey"
              name="secretKey"
              value={inputs.secretKey}
              onChange={handleInputChange}
              placeholder="시크릿 키를 입력하세요"
              type="password"
            />
          </div>

          {status === "error" && (
            <div className="text-sm text-red-500">{errorMessage}</div>
          )}

          {status === "success" && (
            <div className="text-sm text-green-500">
              토큰이 성공적으로 발급되었습니다.
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">취소</Button>
          </DialogClose>
          <Button
            onClick={issueToken}
            variant={buttonProps.variant}
            disabled={buttonProps.disabled}
          >
            {buttonProps.text}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginButton;
