import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rezyapkin — AI dev",
  description: "Visual aesthetic experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
