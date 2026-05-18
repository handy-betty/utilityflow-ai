"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Bug,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  KanbanSquare,
  LogOut,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/work-orders", label: "Work Orders", icon: Wrench },
  { href: "/dispatch", label: "Dispatch", icon: KanbanSquare },
  { href: "/members", label: "Members", icon: Users },
  { href: "/qa", label: "QA Testing", icon: ClipboardCheck },
  { href: "/bugs", label: "Bug Reports", icon: Bug },
  { href: "/release-notes", label: "Release Notes", icon: FileText },
  { href: "/training", label: "Training Docs", icon: GraduationCap },
  { href: "/assistant", label: "AI Help", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
  await supabase.auth.signOut();

  router.replace("/login");

  setTimeout(() => {
    window.location.href = "/login";
  }, 100);
}

  return (
    <aside className="hidden min-h-screen w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
      <div className="mb-8 rounded-2xl bg-brand-700 p-4 text-white">
        <p className="text-sm font-medium text-blue-100">
          Dakota Plains Utility
        </p>
        <h1 className="text-xl font-bold">UtilityFlow AI</h1>
        <p className="mt-2 text-xs leading-5 text-blue-100">
          Mock work management system for utility operations, QA, training, and
          AI-assisted support.
        </p>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-8 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}