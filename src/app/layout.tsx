import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import RegisterSW from "./register-sw";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Campus - Plateforme de Gestion Éducative",
  description: "Plateforme intelligente de gestion éducative avec système de devoirs, dashboards et gestion des utilisateurs.",
  keywords: ["Smart Campus", "Éducation", "Gestion", "Devoirs", "Dashboard", "Enseignants", "Étudiants"],
  authors: [{ name: "Smart Campus Team" }],
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Smart Campus",
    description: "Plateforme de gestion éducative intelligente",
    siteName: "Smart Campus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Campus",
    description: "Plateforme de gestion éducative intelligente",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Smart Campus",
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
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#a855f7" />
        <link rel="apple-touch-icon" href="/ai.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <RegisterSW />
      </body>
    </html>
  );
}
