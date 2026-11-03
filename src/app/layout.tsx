import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup Lens | Football Intelligence Lab",
  description: "Explore clearly fictional football scenarios and learn how a cached intelligence application works.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
