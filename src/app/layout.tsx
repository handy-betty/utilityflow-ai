import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UtilityFlow AI",
  description: "Mock utility work management software portfolio project.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}