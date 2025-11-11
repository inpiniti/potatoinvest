"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useStudioData } from "@/hooks/useStudioData";
import useKakao from "@/hooks/useKakao";
import dayjs from "dayjs";
import { headerStore } from "@/store/headerStore";
import { useEffect, useMemo } from "react";
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
import { accountUiStore } from "@/store/accountUiStore";

const account = () => {
  const { setRight } = headerStore();

  useEffect(() => {
    setRight(
      <Link href="/other/created">
        <Button variant="outline" size="sm">
          <HiOutlineBanknotes /> 계좌추가
        </Button>
      </Link>
    );
    return () => {
      // 페이지 이탈 시 헤더 오른쪽 영역 초기화
      setRight(null);
    };
  }, []);

  const { mutations } = useStudioData();
  // Persisted UI state from zustand
  const {
    selectedId,
    isLogging,
    completed,
    setSelectedId,
    setIsLogging,
    setCompleted,
  } = accountUiStore();

  const handleRowClick = async (id) => {
    if (!id) return;
    setSelectedId(id);
    setIsLogging(true);
    setCompleted(false);
    try {
      await mutations.loginAccount(id);
      setCompleted(true);
    } catch (err) {
      // 로그인 실패는 기존 toast 로 처리되므로 로컬 상태만 업데이트
      setCompleted(false);
    } finally {
      setIsLogging(false);
    }
  };

  const { data } = useKakao();
  const {
    presentBalance, // 계좌 데이터
    accounts, // 계좌 목록
    activeAccountId,
  } = useStudioData();

  // If there's an already active account, reflect it as selected on first mount
  useEffect(() => {
    if (!selectedId && activeAccountId) {
      setSelectedId(activeAccountId);
    }
    // only run when active changes from null and no selection present
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccountId]);

  const output3 = useMemo(() => {
    return presentBalance?.output3;
  }, [presentBalance]);

  if (!data.isLoggedIn) {
    return <>로그인이 필요합니다.</>;
  }

  return (
    <>
      <div className="p-2">
        {isLogging ? (
          <div className="w-full">
            <Item variant="muted">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  계좌 로그인 중...
                </ItemTitle>
              </ItemContent>
            </Item>
          </div>
        ) : completed ? (
          <Alert className="w-full grid grid-cols-2 px-4 gap-4">
            <div className="flex flex-col gap-1">
              <Label>평가손익</Label>
              <Input
                className="text-blue-500 font-bold"
                value={Number(output3?.tot_evlu_pfls_amt).toLocaleString()}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>평가수익률(%)</Label>
              <Input
                className="text-blue-500 font-bold"
                value={Number(output3?.evlu_erng_rt1).toFixed(2)}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>평가금액</Label>
              <Input
                value={Number(output3?.evlu_amt_smtl_amt).toLocaleString()}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>매입금액</Label>
              <Input
                value={Number(output3?.pchs_amt_smtl_amt).toLocaleString()}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>총자산</Label>
              <Input
                value={Number(output3?.tot_asst_amt).toLocaleString()}
                readOnly
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>예수금</Label>
              <Input
                value={Number(output3?.tot_frcr_cblc_smtl).toLocaleString()}
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
