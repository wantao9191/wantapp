import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp } from 'antd';
import { antdTheme } from '@/lib/antd-config';
import '@/lib/dayjs-config'; // 导入 dayjs 配置
import { AuthGuard } from '@/components/auth/AuthGuard';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "长护后台管理系统",
  description: "基于 Next.js + Ant Design 的长护后台管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdRegistry>
          <ConfigProvider theme={antdTheme}>
            <AntdApp>
              <AuthGuard>
                {children}
              </AuthGuard>
            </AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
