"use client";
import React from "react";
import useKakao from "@/hooks/useKakao";
import useAccountsList from "@/hooks/useAccountsList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// 계좌번호 마스킹 유틸
function maskAccount(num) {
  if (!num) return "-";
  const cleaned = String(num).replace(/[^0-9]/g, "");
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 3)}-${"*".repeat(
    Math.max(0, cleaned.length - 7)
  )}${cleaned.slice(-4)}`;
}

export default function AccountsSectionLite() {
  const { data: kakao } = useKakao();
  const {
    data: accounts,
    refresh,
    isLoading,
    isFetching,
    error,
    addAccount,
    adding,
    deleteAccount,
    deleting,
    updateAccountSettings,
    updating,
    selectedAccountId,
    selectAccount,
  } = useAccountsList();

  const loggedIn = kakao.isLoggedIn;
  const hasAccounts = accounts.length > 0;
  const loadingState = loggedIn && (isLoading || (isFetching && !hasAccounts));
  const [mode, setMode] = React.useState("list"); // 'list' | 'create' | 'edit'
  const [form, setForm] = React.useState({
    accountNumber: "",
    alias: "",
    apiKey: "",
    apiSecret: "",
    max_positions: 20,
    target_cash_ratio: 10,
  });
  const [editingId, setEditingId] = React.useState(null);

  const resetForm = () => {
    setForm({
      accountNumber: "",
      alias: "",
      apiKey: "",
      apiSecret: "",
      max_positions: 20,
      target_cash_ratio: 10,
    });
    setEditingId(null);
  };

  const startCreate = () => {
    resetForm();
    setMode("create");
  };

  const handleAdd = async () => {
    await addAccount({
      accountNumber: form.accountNumber.trim(),
      alias: form.alias.trim() || undefined,
      apiKey: form.apiKey.trim(),
      apiSecret: form.apiSecret.trim(),
    });
    resetForm();
    setMode("list");
  };

  const handleDelete = async (id) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await deleteAccount(id);
  };

  const handleUpdateSettings = async (id) => {
    await updateAccountSettings({
      accountId: id,
      max_positions: Number(form.max_positions) || 0,
      target_cash_ratio: Number(form.target_cash_ratio) || 0,
    });
    resetForm();
    setMode("list");
  };

  const openEdit = (acct) => {
    setEditingId(acct.id);
    setForm((f) => ({
      ...f,
      max_positions: acct.max_positions ?? 20,
      target_cash_ratio: acct.target_cash_ratio ?? 10,
    }));
    setMode("edit");
  };

  return (
    <Card className="h-64 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">계좌 목록</CardTitle>
            <CardDescription>
              {loggedIn
                ? "연동된 계좌를 확인하고 추가/관리하세요."
                : "로그인 후 계좌 기능 이용 가능"}
            </CardDescription>
          </div>
          {loggedIn && mode === "list" && (
            <Button size="sm" onClick={startCreate} variant="outline">
              계좌 추가
            </Button>
          )}
          {loggedIn && mode !== "list" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetForm();
                setMode("list");
              }}
            >
              취소
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="relative h-full">
          {!loggedIn && (
            <EmptyState
              label="로그인 필요"
              message="카카오 로그인을 먼저 진행하세요."
            />
          )}
          {loggedIn &&
            mode === "list" &&
            error &&
            !loadingState &&
            !hasAccounts && (
              <EmptyState
                label="오류 발생"
                message={
                  error instanceof Error
                    ? error.message
                    : "계좌를 불러오지 못했습니다."
                }
                actionLabel="다시 시도"
                onAction={() => refresh()}
                variant="destructive"
              />
            )}
          {loggedIn && mode === "list" && loadingState && (
            <ul className="space-y-2 animate-in fade-in">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                  <Skeleton className="h-5 w-10" />
                </li>
              ))}
            </ul>
          )}
          {loggedIn &&
            mode === "list" &&
            !loadingState &&
            !hasAccounts &&
            !error && (
              <EmptyState
                label="계좌 없음"
                message="'계좌 추가' 버튼으로 새 계좌를 등록하세요."
                actionLabel="계좌 추가"
                onAction={startCreate}
              />
            )}
          {loggedIn && mode === "list" && hasAccounts && (
            <ul
              className="divide-y divide-border rounded-md border overflow-auto h-full scroll-smooth"
              data-selected={selectedAccountId ?? ""}
            >
              {accounts.map((a) => {
                const active = selectedAccountId === a.id;
                return (
                  <li
                    key={a.id}
                    onClick={() => selectAccount(a.id)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm cursor-pointer transition-colors",
                      active
                        ? "bg-muted/70 ring-1 ring-border"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {a.alias?.[0]?.toUpperCase() ||
                        a.account_number?.slice(-2) ||
                        "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {a.alias || `계좌 #${a.id}`}
                      </div>
                      <div className="text-xs text-muted-foreground flex gap-2 items-center flex-wrap">
                        <span>{maskAccount(a.account_number)}</span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      disabled={deleting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(a.id);
                      }}
                      title="삭제"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">삭제</span>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          {loggedIn && mode === "create" && (
            <AccountForm
              form={form}
              setForm={setForm}
              submitting={adding}
              onSubmit={handleAdd}
              onCancel={() => {
                resetForm();
                setMode("list");
              }}
            />
          )}
          {loggedIn && mode === "edit" && editingId != null && (
            <SettingsForm
              form={form}
              setForm={setForm}
              submitting={updating}
              onSubmit={() => handleUpdateSettings(editingId)}
              onCancel={() => {
                resetForm();
                setMode("list");
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  label,
  message,
  actionLabel,
  onAction,
  variant = "default",
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
      <p
        className={cn(
          "text-sm font-medium",
          variant === "destructive" && "text-destructive"
        )}
      >
        {label}
      </p>
      <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant={variant === "destructive" ? "destructive" : "outline"}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function AccountForm({ form, setForm, submitting, onSubmit, onCancel }) {
  return (
    <form
      className="absolute inset-0 flex flex-col gap-3 p-2 overflow-auto"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Field label="계좌번호">
        <Input
          value={form.accountNumber}
          onChange={(e) =>
            setForm((f) => ({ ...f, accountNumber: e.target.value }))
          }
          required
          placeholder="숫자만"
        />
      </Field>
      <Field label="별칭">
        <Input
          value={form.alias}
          onChange={(e) => setForm((f) => ({ ...f, alias: e.target.value }))}
          placeholder="선택 입력"
        />
      </Field>
      <Field label="API Key">
        <Input
          value={form.apiKey}
          onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
          required
        />
      </Field>
      <Field label="API Secret">
        <Input
          value={form.apiSecret}
          onChange={(e) =>
            setForm((f) => ({ ...f, apiSecret: e.target.value }))
          }
          required
        />
      </Field>
      <div className="mt-2 flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={submitting}
        >
          취소
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}

function SettingsForm({ form, setForm, submitting, onSubmit, onCancel }) {
  return (
    <form
      className="absolute inset-0 flex flex-col gap-3 p-2 overflow-auto"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Field label="최대 보유 종목 수">
        <Input
          type="number"
          min={1}
          value={form.max_positions}
          onChange={(e) =>
            setForm((f) => ({ ...f, max_positions: Number(e.target.value) }))
          }
          required
        />
      </Field>
      <Field label="목표 현금 비중 (%)">
        <Input
          type="number"
          min={0}
          max={100}
          value={form.target_cash_ratio}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              target_cash_ratio: Number(e.target.value),
            }))
          }
          required
        />
      </Field>
      <div className="mt-2 flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={submitting}
        >
          취소
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
