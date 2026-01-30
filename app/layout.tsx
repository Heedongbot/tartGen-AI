import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "StartGen AI - 나만의 창업 아이디어 생성기",
  description: "AI가 분석하는 맞춤형 창업 아이디어와 로드맵",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning translate="no" className="dark">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased font-sans bg-[#000000] text-foreground min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
