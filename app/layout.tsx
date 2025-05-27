import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import "@ant-design/v5-patch-for-react-19";
import "./globals.css";
import { ReactQueryClientProvider } from "@/providers/react-query-provider";
import { SocketProvider } from "@/providers/socket-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Sorsend",
  description: "Mini Sorsend with next.js and Ant Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <AntdRegistry>
            <ConfigProvider>
              <SocketProvider>{children}</SocketProvider>
            </ConfigProvider>
          </AntdRegistry>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
