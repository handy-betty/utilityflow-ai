import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "UtilityFlow AI",
  description: "Mock utility work management software portfolio project.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <div className="min-h-screen lg:flex">
            <Sidebar />
            <main className="flex-1">
              <MobileNav />
              <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}