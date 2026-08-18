import type { Metadata } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/redux/provider";
import AuthInitializer from "@/lib/redux/auth-initializer";

const almarai = Almarai({
  subsets: ["arabic"],
  variable: "--font-sans",
  weight: "400",
});

export const metadata: Metadata = {
  title: "AgeWellRI",
  description: "AgeWellRI Member and Administrator Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={almarai.variable}>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#F7FAFC] text-[#243746] antialiased selection:bg-[#EAF3F8] selection:text-[#294B68]"
      >
        <StoreProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
