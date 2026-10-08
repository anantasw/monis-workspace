import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Gochi_Hand, Inter } from "next/font/google";
import { LightProvider } from "@/components/builder/light-context";
import { SetupProvider } from "@/components/builder/setup-context";
import { SiteHeader } from "@/components/ui/site-header";
import { ToastProvider } from "@/components/ui/toast-context";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
});

const gochi = Gochi_Hand({
  variable: "--font-gochi",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  title: {
    default: "Design your Bali workspace | monis.rent",
    template: "%s | monis.rent Workspace Builder",
  },
  description:
    "Build your desk setup visually: pick a desk, a chair, screens and more, see it in a Bali room, then rent it by the week.",
  openGraph: {
    type: "website",
    siteName: "monis.rent Workspace Builder",
  },
};

export const viewport: Viewport = {
  themeColor: "#15252e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} ${gochi.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only z-50 rounded-control bg-brand px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Skip to content
        </a>
        <ToastProvider>
          <SetupProvider>
            <LightProvider>
              <SiteHeader />
              {children}
              <Toaster />
            </LightProvider>
          </SetupProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
