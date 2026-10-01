import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "FB Post Pro - Quản lý đăng bài Facebook Sale/Marketing",
  description:
    "Hệ thống quản lý đăng bài Facebook đa kênh chuyên nghiệp dành cho nhân viên Sale & Marketing tuân thủ Meta Graph API chính thức.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
