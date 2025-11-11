"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import useKakao from "@/hooks/useKakao";
import { useAccounts } from "@/hooks/useAccounts";
import { useHantu } from "@/hooks/useHantu";
import { useBalance } from "@/hooks/useBalance";
import dayjs from "dayjs";
import { headerStore } from "@/store/headerStore";
import { useEffect, useMemo, useState } from "react";
import { HiOutlineBanknotes } from "react-icons/hi2";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";

const account = () => {
  const { setRight } = headerStore();
  const { data: kakaoData } = useKakao();

  // 새 훅 사용: 계좌 목록 조회
  const {
    data: accounts,
    isLoading: accountsLoading,
    refetch: refetchAccounts,
  } = useAccounts({ enabled: kakaoData.isLoggedIn });

  // 새 훅 사용: 한투 로그인 및 활성 계좌 관리
  const { activeAccountId, selectAccount, login, loggingIn } = useHantu();

  // 새 훅 사용: 잔고 조회
  const {
    data,
    assetInfo,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useBalance();

  // 로컬 UI 상태
  const [selectedId, setSelectedId] = useState(activeAccountId);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setRight(
      <Link href="/other/created">
        <Button variant="outline" size="sm">
          <HiOutlineBanknotes /> 계좌추가
        </Button>
      </Link>
    );
    return () => {
      setRight(null);
    };
  }, []);

  // 계좌 선택 및 로그인 처리
  const handleRowClick = async (id) => {
    if (!id) return;
    setSelectedId(id);
    selectAccount(id);
    setCompleted(false);
    try {
      await login(id);
      // 로그인 성공 후 잔고 조회 트리거
      setTimeout(() => {
        refetchBalance();
      }, 500);
      setCompleted(true);
    } catch (err) {
      setCompleted(false);
    }
  };

  // activeAccountId 변경 시 selectedId 동기화
  useEffect(() => {
    if (activeAccountId) {
      setSelectedId(activeAccountId);
    }
  }, [activeAccountId]);

  // 카카오 로그인 후 계좌 목록 재조회
  useEffect(() => {
    if (kakaoData.isLoggedIn && !accountsLoading) {
      refetchAccounts();
    }
  }, [kakaoData.isLoggedIn]);

  // assetInfo가 로드되면 자동으로 completed 상태로 전환
  useEffect(() => {
    if (assetInfo && activeAccountId && !balanceLoading) {
      setCompleted(true);
    }
  }, [assetInfo, activeAccountId, balanceLoading]);

  if (!kakaoData.isLoggedIn) {
    return <>로그인이 필요합니다.</>;
  }

  return (
    <>
      <div className="p-2">
        {loggingIn || balanceLoading ? (
          <div className="w-full">
            <Item variant="muted">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  {loggingIn ? "계좌 로그인 중..." : "잔고 조회 중..."}
                </ItemTitle>
              </ItemContent>
            </Item>
          </div>
        ) : completed && assetInfo ? (
          <Alert className="w-full grid grid-cols-2 px-4 gap-4">
            <div className="flex flex-col gap-1">
              <Label>평가손익</Label>
              <Input
                className={`font-bold ${
                  Number(assetInfo?.tot_evlu_pfls_amt || 0) >= 0
                    ? "text-blue-500"
                    : "text-red-500"
                }`}
                value={Number(
                  assetInfo?.tot_evlu_pfls_amt || 0
                ).toLocaleString()}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>평가수익률(%)</Label>
              <Input
                className={`font-bold ${
                  Number(assetInfo?.evlu_erng_rt1 || 0) >= 0
                    ? "text-blue-500"
                    : "text-red-500"
                }`}
                value={Number(assetInfo?.evlu_erng_rt1 || 0).toFixed(2)}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>평가금액</Label>
              <Input
                value={Number(
                  assetInfo?.evlu_amt_smtl_amt || 0
                ).toLocaleString()}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>매입금액</Label>
              <Input
                value={Number(
                  assetInfo?.pchs_amt_smtl_amt || 0
                ).toLocaleString()}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>총자산</Label>
              <Input
                value={Number(assetInfo?.tot_asst_amt || 0).toLocaleString()}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>예수금</Label>
              <Input
                value={Number(
                  assetInfo?.tot_frcr_cblc_smtl || 0
                ).toLocaleString()}
                readOnly
              />
            </div>
          </Alert>
        ) : (
          <Alert
            variant="destructive"
            className="text-red-500 w-full bg-red-50 border-red-200"
          >
            <AlertCircleIcon />
            <AlertTitle>계좌를 선택해주세요.</AlertTitle>
            <AlertDescription>
              <p>아직 계좌를 선택하지 않았습니다.</p>
              <ul className="list-inside list-disc text-sm">
                <li>선택한 계좌의 정보를 볼 수 있습니다.</li>
                <li>보유한 종목을 확인할 수 있습니다.</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <Table className="border-y">
        <TableHeader>
          <TableRow>
            <TableHead>계좌이름</TableHead>
            <TableHead>계좌번호</TableHead>
            <TableHead>생성일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow
              key={account.id}
              className={`cursor-pointer hover:bg-gray-50 ${
                selectedId === account.id ? "bg-gray-100" : ""
              }`}
              onClick={() => handleRowClick(account.id)}
            >
              <TableCell>{account.alias}</TableCell>
              <TableCell>{account.account_number}</TableCell>
              <TableCell>
                {dayjs(account.created_at).format("YYYY-MM-DD")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default account;
