import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "deal-flow ",
  description: "가장 저렴하게 사고, 부자되자.",
  keywords: ["next.js", "react", "typescript"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
