import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/store-provider";
import { SidebarProvider } from "@/contexts/SidebarContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartCare - Healthcare Management System",
  description: "Comprehensive healthcare management platform for doctors, patients, and administrators",
  keywords: "healthcare, medical, appointments, patient management, doctor dashboard",
  icons: {
    icon: [
      { url: '/icons/SC-logo.png', sizes: 'any' },
    ],
    shortcut: '/icons/SC-logo.png',
    apple: '/icons/SC-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
