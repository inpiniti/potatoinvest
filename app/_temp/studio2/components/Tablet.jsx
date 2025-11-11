"use client";
import React from "react";
import { useViewportRange } from "./useViewportRange";

// 768px ~ 1023px
export default function Tablet({ children }) {
	const match = useViewportRange({ min: 768, max: 1023 });
	if (!match) return null;
	return <>{children}</>;
}
