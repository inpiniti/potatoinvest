"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, Loader2 } from "lucide-react"
import { useKakao } from "@/hooks/useKakao"

export function LoginSection() {
    const { data, login, logout } = useKakao()
    const { isLoggedIn, user, loading } = data

    const handleLogin = async () => {
        try {
            await login()
        } catch (error) {
            console.error("Login failed:", error)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="px-2 py-2">
            {isLoggedIn && user ? (
                <div className="space-y-2">
                    <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email || "사용자"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                    </Button>
                </div>
            ) : (
                <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={handleLogin}
                >
                    <LogIn className="mr-2 h-4 w-4" />
                    카카오 로그인
                </Button>
            )}
        </div>
    )
}
