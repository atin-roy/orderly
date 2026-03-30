import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orderly — Premium Food Delivery",
  description:
    "Discover bold Indian flavours, local restaurant favourites, and fast delivery with rupee-first pricing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
