import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./globals.css";
import { Noto_Sans_KR, Noto_Serif_KR, Inter } from "next/font/google";


// 앱 전체 공통 레이아웃
// - 전체 폰트 설정 
// - 공통 배경색, 기본 텍스트 스타일 
// - 모든 페이지에 공통으로 들어갈 wrapper
// - metadata 기본값

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anabyss",
  description: "Exam Service",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${notoSerifKr.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}