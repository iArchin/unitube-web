import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import TopNavigation from "@/components/TopNavigation";
import Sidebar from "@/components/Sidebar";
import FooterMenu from "@/components/FooterMenu";
import Footer from "@/components/Footer";
import ContextProvider from "@/components/ContextProvider";
import ReduxProvider from "@/components/ReduxProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UniTube",
  description:
    "UniTube is a video streaming platform that allows you to watch videos from your favorite channels.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            <ContextProvider>
              <main className="pt-0">{children}</main>
              <TopNavigation />
              <Sidebar />
              <FooterMenu />
              <Footer />
            </ContextProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
