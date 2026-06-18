import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWGenesis | Website & Brand Setup Services",
  description:
    "Fixed-price website and brand setup services for small businesses with secure Stripe checkout.",
  icons: {
    icon: "/logo-icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}