import type React from "react"
import type { Metadata } from "next"
import { JetBrains_Mono, Space_Grotesk } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/Providers"
import { BackgroundLayout } from "@/components/BackgroundLayout"
import "./globals.css"

const motterTektura = localFont({
  src: "../public/fonts/Motter Tektura Normal.ttf",
  variable: "--font-motter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      <body className={`${motterTektura.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" storageKey="facinet-theme">
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
