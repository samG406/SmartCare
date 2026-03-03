import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
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

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-plus-jakarta",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
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
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakartaSans.variable} ${instrumentSerif.variable} antialiased`}
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
