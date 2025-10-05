"use client";
import React from "react";
import { useViewportRange } from "./useViewportRange";

// 425px ~ 767px
export default function MobileL({ children }) {
	const match = useViewportRange({ min: 425, max: 767 });
	if (!match) return null;
	return <>{children}</>;
}
