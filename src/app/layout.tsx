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
  description:
    "Plateforme intelligente de gestion éducative avec système de devoirs, dashboards et gestion des utilisateurs.",
  keywords: [
    "Smart Campus",
    "Éducation",
    "Gestion",
    "Devoirs",
    "Dashboard",
    "Enseignants",
    "Étudiants",
  ],
  authors: [{ name: "Smart Campus Team" }],
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#a855f7" />
        <link rel="apple-touch-icon" href="/ai.png" />

        {/* Inline manifest */}
        <script type="application/manifest+json" dangerouslySetInnerHTML={{ __html: `
          {
            "name": "Smart Campus",
            "short_name": "Smart Campus",
            "start_url": "/",
            "scope": "/",
            "description": "Task management and learning app",
            "orientation": "portrait",
            "display": "standalone",
            "background_color": "#0a0e1a",
            "theme_color": "#a855f7",
            "screenshots": [
              {
                "src": "/ai.png",
                "sizes": "512x512",
                "type": "image/png",
                "form_factor": "wide",
                "label": "Smart Campus Dashboard"
              },
              {
                "src": "/ai.png",
                "sizes": "512x512",
                "type": "image/png",
                "label": "Smart Campus Learning"
              }
            ],
            "icons": [
              {
                "src": "/ai.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any"
              },
              {
                "src": "/ai.png",
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any"
              },
              {
                "src": "/ai.png",
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "maskable"
              }
            ]
          }
        `}} />
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