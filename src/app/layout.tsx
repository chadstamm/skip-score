import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkipScore | Score Your Meetings Before You Book Them",
  description: "Stop wasting time in bad meetings. SkipScore analyzes 10+ factors to score your meeting, build better agendas, and reclaim your calendar. Works with Zoom, Teams, and Google Meet.",
  keywords: ["meeting score", "meeting assessment", "meeting productivity", "skip meetings", "agenda builder", "meeting cost", "Zoom", "Microsoft Teams", "Google Meet", "EOS", "Traction", "L10"],
  authors: [{ name: "Chad Stamm", url: "https://chadstamm.com" }],
  creator: "TMC Digital Media",
  metadataBase: new URL("https://skipscore.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://skipscore.app",
    siteName: "SkipScore",
    title: "SkipScore | Score Your Meetings Before You Book Them",
    description: "Stop wasting time in bad meetings. SkipScore analyzes 10+ factors to score your meeting, build better agendas, and reclaim your calendar.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkipScore | Score Your Meetings Before You Book Them",
    description: "Stop wasting time in bad meetings. Score your meetings, build better agendas, reclaim your calendar.",
    creator: "@chadstamm",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    "apple-mobile-web-app-title": "SkipScore",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0D9488" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
