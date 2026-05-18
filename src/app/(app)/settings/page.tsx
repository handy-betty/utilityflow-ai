import PageHeader from "@/components/PageHeader";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Project configuration and next implementation milestones." />
      <section className="card p-5">
        <h3 className="text-lg font-semibold text-slate-950">Environment Status</h3>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4"><span className="block text-xs font-semibold uppercase text-slate-500">Supabase</span>{isSupabaseConfigured ? "Configured" : "Not configured — using local demo data"}</div>
          <div className="rounded-xl bg-slate-50 p-4"><span className="block text-xs font-semibold uppercase text-slate-500">Deployment</span>Ready for Vercel</div>
          <div className="rounded-xl bg-slate-50 p-4"><span className="block text-xs font-semibold uppercase text-slate-500">AI Mode</span>Controlled help-doc matching</div>
          <div className="rounded-xl bg-slate-50 p-4"><span className="block text-xs font-semibold uppercase text-slate-500">Portfolio Goal</span>DVR retraining evidence</div>
        </div>
      </section>
    </div>
  );
}
