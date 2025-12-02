"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { useAccountsList } from "@/hooks/useAccountsList"

export function AccountAddButton() {
    const { addAccount, adding } = useAccountsList()
    const [isSheetOpen, setIsSheetOpen] = React.useState(false)
    const [newAccount, setNewAccount] = React.useState({
        alias: "",
        accountNo: "",
        apiKey: "",
        secretKey: "",
    })

    const handleAddAccount = async () => {
        if (!newAccount.alias || !newAccount.accountNo || !newAccount.apiKey || !newAccount.secretKey) {
            alert("모든 필드를 입력해주세요")
            return
        }

        try {
            await addAccount({
                accountNumber: newAccount.accountNo,
                alias: newAccount.alias,
                apiKey: newAccount.apiKey,
                apiSecret: newAccount.secretKey,
            })
            setNewAccount({ alias: "", accountNo: "", apiKey: "", secretKey: "" })
            setIsSheetOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-muted-foreground hover:text-foreground"
                    title="계좌 추가"
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>계좌 추가</SheetTitle>
                    <SheetDescription>
                        한국투자증권 계좌 정보를 입력해주세요
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="alias">계좌 별칭</Label>
                        <Input
                            id="alias"
                            placeholder="예: 메인 계좌"
                            value={newAccount.alias}
                            onChange={(e) => setNewAccount({ ...newAccount, alias: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="accountNo">계좌번호</Label>
                        <Input
                            id="accountNo"
                            placeholder="1234567801"
                            value={newAccount.accountNo}
                            onChange={(e) => setNewAccount({ ...newAccount, accountNo: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            placeholder="App Key"
                            value={newAccount.apiKey}
                            onChange={(e) => setNewAccount({ ...newAccount, apiKey: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="secretKey">Secret Key</Label>
                        <Input
                            id="secretKey"
                            type="password"
                            placeholder="App Secret"
                            value={newAccount.secretKey}
                            onChange={(e) => setNewAccount({ ...newAccount, secretKey: e.target.value })}
                        />
                    </div>
                </div>
                <SheetFooter>
                    <Button onClick={handleAddAccount} className="w-full" disabled={adding}>
                        {adding ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                추가 중...
                            </>
                        ) : (
                            "추가"
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
