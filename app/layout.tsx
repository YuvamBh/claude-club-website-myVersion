import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "./components/ThemeProvider";
// import DarkModeToggle from "./components/DarkModeToggle";
import { Analyze } from "./components/analytics/Analyze";
import "./globals.css";
import Script from "next/script";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://claudebuilder.club"),
  title: "ASU Claude Builder Club",
  description: "ASU Claude Builder Club - Building with Claude AI",
  openGraph: {
    type: "website",
    siteName: "ASU Claude Builder Club",
    url: "https://claudebuilder.club",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body
        suppressHydrationWarning
        className={`${poppins.variable} antialiased absolute top-0 left-0 w-full h-[100dvh] overflow-auto`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {/* ── Sitewide ambient glow ── fixed so it spans every page ── */}
          <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {/* Top-right warm blob */}
            <div
              className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
              style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 65%)' }}
            />
            {/* Top-left cool accent blob */}
            <div
              className="absolute -top-16 -left-16 w-[420px] h-[420px] rounded-full opacity-10 blur-[100px]"
              style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 65%)' }}
            />
            {/* Bottom-left warm blob */}
            <div
              className="absolute -bottom-32 -left-24 w-[500px] h-[500px] rounded-full opacity-15 blur-[110px]"
              style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 65%)' }}
            />
            {/* Bottom-right subtle blob */}
            <div
              className="absolute -bottom-16 -right-16 w-[360px] h-[360px] rounded-full opacity-10 blur-[90px]"
              style={{ background: 'radial-gradient(circle, var(--theme-text-accent) 0%, transparent 65%)' }}
            />
          </div>

          {children}
          {/* <DarkModeToggle /> */}
          <Analytics />
          <SpeedInsights />
          <Analyze />
        </ThemeProvider>
        <Script
          src="https://asucbc-umami.vercel.app/script.js"
          data-website-id={
            process.env.NEXT_PUBLIC_LOCAL_UMAMI_OVERRIDE_ID ||
            "407772a6-dc54-4c85-8e46-327d20c45c26"
          }
          data-auto-track="false"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
