"use client";
import React from "react";
import { useViewportRange } from "./useViewportRange";

// 375px ~ 424px
export default function MobileM({ children }) {
	const match = useViewportRange({ min: 375, max: 424 });
	if (!match) return null;
	return <>{children}</>;
}
