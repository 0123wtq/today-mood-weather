import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mood Weather · 감정 날씨 일기",
  description: "오늘 마음을 날씨처럼 기록하는 한 줄 감정 일기",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#F5F7FA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
