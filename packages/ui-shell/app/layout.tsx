import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"

export const metadata: Metadata = {
  title: "DNA Studio - Product Definition",
  description: "Define and visualize software product DNA",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
