import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AccountMenu } from "@/components/account-menu"
import { AppToaster } from "@/components/app-toaster"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transapp",
  description: "Translation app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
    
        
        <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >


        <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link
              href="/"
              className="text-foreground text-lg font-semibold tracking-tight transition-opacity hover:opacity-85"
            >
              Transapp
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <ModeToggle />
              <AccountMenu />
            </div>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <AppToaster />

        </ThemeProvider>
      </body>
    </html>
  );
}
