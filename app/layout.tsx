import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Today: Mood & Weather",
  description: "오늘의 기분과 날씨를 한눈에",
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
