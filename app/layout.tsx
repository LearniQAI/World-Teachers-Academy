import type { Metadata } from "next";
import "./globals.css";
import MagicCursor from "@/components/layout/MagicCursor";
import SideMenu from "@/components/layout/SideMenu";
import MobileMenu from "@/components/layout/MobileMenu";
import ColorSwitcher from "@/components/layout/ColorSwitcher";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeScripts from "@/components/layout/ThemeScripts";

export const metadata: Metadata = {
  title: "Escul - Online Courses & Education HTML Template - Home XI (Skill Development)",
  description: "Escul - Online Courses & Education HTML Template",
  icons: {
    icon: [
      { url: "/assets/img/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/img/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/assets/img/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/img/favicons/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/assets/img/favicons/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/assets/img/favicons/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/assets/img/favicons/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/assets/img/favicons/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/assets/img/favicons/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/assets/img/favicons/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/assets/img/favicons/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/assets/img/favicons/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/assets/img/favicons/apple-icon-180x180.png", sizes: "180x180" },
    ],
  },
  manifest: "/assets/img/favicons/manifest.json",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className="no-js" lang="zxx" dir="ltr">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/assets/img/favicons/ms-icon-144x144.png" />
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Serif:ital,wght@0,100..900;1,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
        {/* Escul theme core stylesheets (loaded as plain <link> tags — a CSS @import
            of an absolute /public path in globals.css fails to resolve under Next.js's
            bundler, so these are linked directly instead) */}
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/fontawesome.min.css" />
        <link rel="stylesheet" href="/assets/css/magnific-popup.min.css" />
        <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body className="th-magic-cursor theme-style4">
        <MagicCursor />
        <SideMenu />
        <MobileMenu />
        <ColorSwitcher />
        <Header />
        {children}
        <Footer />
        <ThemeScripts />
      </body>
    </html>
  );
}
