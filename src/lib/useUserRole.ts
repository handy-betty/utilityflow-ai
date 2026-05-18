"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { normalizeRole, type UserRole } from "@/lib/roles";

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
};

export function useUserRole() {
  const [role, setRole] = useState<UserRole>("readonly");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function loadRole() {
      setLoadingRole(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setRole("readonly");
        setProfile(null);
        setLoadingRole(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("id", session.user.id)
        .single();

      if (error || !data) {
        setRole("readonly");
        setProfile(null);
        setLoadingRole(false);
        return;
      }

      setProfile(data);
      setRole(normalizeRole(data.role));
      setLoadingRole(false);
    }

    loadRole();
  }, []);

  return { role, profile, loadingRole };
}
