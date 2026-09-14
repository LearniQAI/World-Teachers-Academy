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
  title: "World Teachers Academy - Get Certified. Get Hired.",
  description:
    "World Teachers Academy helps educators get internationally recognized teaching certifications and connects them with verified teaching jobs worldwide.",
  icons: {
    icon: [{ url: "/assets/img/world-teachers-logo.jpeg", type: "image/jpeg" }],
    apple: [{ url: "/assets/img/world-teachers-logo.jpeg" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className="no-js" lang="zxx" dir="ltr">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/assets/img/world-teachers-logo.jpeg" />
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
