"use client";
import React from "react";
import { useViewportRange } from "./useViewportRange";

// 1024px ~ 1439px
export default function Laptop({ children }) {
	const match = useViewportRange({ min: 1024, max: 1439 });
	if (!match) return null;
	return <>{children}</>;
}
