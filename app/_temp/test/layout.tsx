'use client';
import React from 'react';
export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallpaperList = [
    'vecteezy_background-detailed-high-quality-hdr-4k-ultra-hd_44153184',
    'vecteezy_nature-background-high-resolution-wallpaper-for-a-serene_49855190',
    'vecteezy_nature-background-high-resolution-wallpaper-for-a-serene_49855708',
  ];
  const randombgUrl = `/images/${
    wallpaperList[Math.floor(Math.random() * wallpaperList.length)]
  }.jpg`;

  return (
    <div className="relative min-h-screen">
      {/* Background image - fills viewport, preserves aspect ratio, no blank space */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url("${randombgUrl}")` }}
        aria-hidden="true"
      />

      {/* Foreground content */}
      <div className="relative z-10 flex min-h-screen flex-col gap-4 p-4">
        {children}
      </div>
    </div>
  );
}
