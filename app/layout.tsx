import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import LoadingPage from "@/components/loading/loading-page"
import { OrganizationSchema, SoftwareApplicationSchema } from "@/components/seo/structured-data"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Derno - Modern Tutoring Management Platform",
    template: "%s | Derno"
  },
  description: "Derno is a comprehensive tutoring management platform that helps tutors schedule sessions, track student progress, manage payments, and grow their business. Streamline your tutoring operations with powerful analytics and intuitive tools.",
  keywords: ["tutoring management", "tutor platform", "session scheduling", "student management", "payment tracking", "tutoring software", "education management", "private tutoring", "online tutoring"],
  authors: [{ name: "Derno" }],
  creator: "Derno",
  publisher: "Derno",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://derno.vercel.app",
    title: "Derno - Modern Tutoring Management Platform",
    description: "Streamline your tutoring business with Derno. Schedule sessions, track progress, manage payments, and grow with powerful analytics.",
    siteName: "Derno",
    images: [
      {
        url: "/logo derno.png",
        width: 1200,
        height: 630,
        alt: "Derno - Tutoring Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Derno - Modern Tutoring Management Platform",
    description: "Streamline your tutoring business with Derno. Schedule sessions, track progress, manage payments, and grow with powerful analytics.",
    images: ["/logo derno.png"],
    creator: "@derno",
  },
  icons: {
    icon: "/squareTabLogo.png",
    apple: "/squareTabLogo.png",
    shortcut: "/squareTabLogo.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://derno.vercel.app"),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "google-site-verification-token",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#F9FAFB" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1F1F1F" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <OrganizationSchema />
        <SoftwareApplicationSchema />
      </head>
      <body className={`font-sans bg-background ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} themes={["dark", "light"]}>
          <Suspense
            fallback={
              <LoadingPage
                title="Launching Derno"
                description="Polishing the dashboard experience and loading your personalized workspace."
                tip="Stay tuned—the tools you need to run your tutoring business are seconds away."
              />
            }
          >
            {children}
          </Suspense>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
