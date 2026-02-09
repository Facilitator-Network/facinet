import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/Providers"
import { BackgroundLayout } from "@/components/BackgroundLayout"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Facinet - Distributed Facilitator Network",
  description: "The infrastructure layer for the autonomous agent economy.",
  generator: "v0.app",

}

export const viewport = {
  width: 1280,
  initialScale: 0.3,
  maximumScale: 1,
  userScalable: true,
}

import HeroAsciiWrapper from "@/components/ui/hero-ascii-one"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <div className="relative min-h-screen flex flex-col">
              <BackgroundLayout />
              <HeroAsciiWrapper>
                {children}
              </HeroAsciiWrapper>
            </div>
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
