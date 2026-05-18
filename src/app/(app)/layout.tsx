import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AuthGuard from "@/components/AuthGuard";
import RoleGate from "@/components/RoleGate";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <RoleGate>
        <div className="min-h-screen lg:flex">
          <Sidebar />
          <main className="flex-1">
            <MobileNav />
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </RoleGate>
    </AuthGuard>
  );
}