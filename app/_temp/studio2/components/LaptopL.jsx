"use client";
import React from "react";
import { useViewportRange } from "./useViewportRange";

// 1440px ~ 2559px
export default function LaptopL({ children }) {
	const match = useViewportRange({ min: 1440, max: 2559 });
	if (!match) return null;
	return <>{children}</>;
}
