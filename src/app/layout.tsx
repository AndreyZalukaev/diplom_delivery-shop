import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/header/Header";
import Footer from "../components/Footer";
import { Suspense } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { RegFormProvider } from "@/contexts/RegFormContext";
import { CartProvider } from "@/contexts/CartContext";

const rubik = localFont({
  src: [
    {
      path: "../fonts/Rubik-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../fonts/Rubik-Italic-VariableFont_wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "Северяночка",
  description: "Доставка и покупка продуктов питания",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${rubik.variable} font-sans`}>
        <CartProvider>
        <RegFormProvider>
          <Header />
          <Suspense fallback={<div />}><Breadcrumbs /></Suspense>
          {children}
          <Footer />
        </RegFormProvider>
        </CartProvider>
      </body>
    </html>
  );
}
