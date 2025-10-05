"use client";
import React from "react";
import { useViewportRange } from "./useViewportRange";

// 2560px 이상
export default function FourK({ children }) {
	const match = useViewportRange({ min: 2560 });
	if (!match) return null;
	return <>{children}</>;
}
