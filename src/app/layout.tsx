import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkipScore | Meeting Assessment Tool",
  description: "Stop wasting time. Score your meeting before you book it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
        <footer className="py-8 text-center text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} SkipScore. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
