import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GradWise - College Prep Platform",
  description:
    "Your personalized college preparation journey with AI-powered tools, virtual counseling, and comprehensive guidance.",
  keywords: [
    "college prep",
    "college admissions",
    "SAT prep",
    "essay help",
    "college counseling",
    "FAFSA",
    "college applications",
  ],
  authors: [{ name: "GradWise Team" }],
  creator: "GradWise",
  publisher: "GradWise",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "GradWise - College Prep Platform",
    description: "Your personalized college preparation journey with AI-powered tools and guidance.",
    url: "https://gradwise.app",
    siteName: "GradWise",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GradWise - College Prep Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GradWise - College Prep Platform",
    description: "Your personalized college preparation journey with AI-powered tools and guidance.",
    images: ["/og-image.png"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
