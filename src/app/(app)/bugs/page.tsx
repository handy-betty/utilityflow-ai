"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import PermissionNotice from "@/components/PermissionNotice";
import { priorityBadge } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { canWrite } from "@/lib/roles";
import { useUserRole } from "@/lib/useUserRole";

type BugReport = {
  id: string;
  module: string;
  title: string;
  steps_to_reproduce: string | null;
  expected_result: string | null;
  actual_result: string | null;
  severity: string | null;
  priority: string;
  status: string;
  notes: string | null;
  created_at: string | null;
};

const emptyForm = {
  module: "Work Orders",
  title: "",
  steps_to_reproduce: "",
  expected_result: "",
  actual_result: "",
  severity: "Medium",
  priority: "Normal",
  status: "Open",
  notes: "",
};

const modules = [
  "Dashboard",
  "Members",
  "Work Orders",
  "Dispatch",
  "QA Testing",
  "Bug Reports",
  "Training Docs",
  "AI Help",
];

const severities = ["Low", "Medium", "High", "Critical"];
const priorities = ["Low", "Normal", "High", "Urgent"];
const statuses = ["Open", "In Progress", "Fixed", "Retest", "Closed"];

function severityClass(severity: string | null) {
  if (severity === "Critical") return "bg-red-50 text-red-700 border-red-200";
  if (severity === "High") return "bg-orange-50 text-orange-700 border-orange-200";
  if (severity === "Medium") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function bugStatusClass(status: string) {
  if (status === "Open") return "bg-red-50 text-red-700 border-red-200";
  if (status === "In Progress") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "Fixed") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "Retest") return "bg-purple-50 text-purple-700 border-purple-200";
  if (status === "Closed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function BugsPage() {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { role } = useUserRole();
  const userCanWrite = canWrite(role);

  async function loadBugReports() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("bug_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Load error: ${error.message}`);
      setLoading(false);
      return;
    }

    setBugReports(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBugReports();
  }, []);

  function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createBugReport() {
    setMessage(null);

    if (!userCanWrite) {
      setMessage("Read-only users cannot create bug reports.");
      return;
    }

    if (!form.title.trim()) {
      setMessage("Bug title is required.");
      return;
    }

    if (!form.steps_to_reproduce.trim()) {
      setMessage("Steps to reproduce are required.");
      return;
    }

    if (!form.expected_result.trim()) {
      setMessage("Expected result is required.");
      return;
    }

    if (!form.actual_result.trim()) {
      setMessage("Actual result is required.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("bug_reports")
      .insert({
        module: form.module,
        title: form.title.trim(),
        steps_to_reproduce: form.steps_to_reproduce.trim(),
        expected_result: form.expected_result.trim(),
        actual_result: form.actual_result.trim(),
        severity: form.severity,
        priority: form.priority,
        status: form.status,
        notes: form.notes.trim() || null,
      })
      .select()
      .single();

    if (error) {
      setMessage(`Create error: ${error.message}`);
      setSaving(false);
      return;
    }

    if (data) {
      setBugReports((current) => [data, ...current]);

      await supabase.from("activity_log").insert({
        module: "Bug Reports",
        action: "Bug Created",
        details: `Bug created in ${data.module}: ${data.title}`,
      });
    }

    setForm(emptyForm);
    setMessage("Bug report created.");
    setSaving(false);
  }

  async function updateBugStatus(bugId: string, status: string) {
    setMessage(null);

    if (!userCanWrite) {
      setMessage("Read-only users cannot update bug status.");
      return;
    }

    const { data, error } = await supabase
      .from("bug_reports")
      .update({ status })
      .eq("id", bugId)
      .select()
      .single();

    if (error) {
      setMessage(`Status update error: ${error.message}`);
      return;
    }

    setBugReports((current) =>
      current.map((bug) => (bug.id === bugId ? data : bug))
    );

    await supabase.from("activity_log").insert({
      module: "Bug Reports",
      action: "Status Updated",
      details: `Bug ${bugId} updated to ${status}`,
    });
  }

  async function deleteBugReport(bugId: string) {
    if (!userCanWrite) {
      setMessage("Read-only users cannot delete bug reports.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this bug report? This is only for the demo build."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("bug_reports")
      .delete()
      .eq("id", bugId);

    if (error) {
      setMessage(`Delete error: ${error.message}`);
      return;
    }

    setBugReports((current) => current.filter((bug) => bug.id !== bugId));
    setMessage("Bug report deleted.");
  }

  return (
    <div>
      <PageHeader
        title="Bug Reports"
        subtitle="Documented prototype issues with severity, priority, reproduction steps, and expected behavior."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {!userCanWrite && <PermissionNotice />}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Bug Register
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading bug reports..."
                  : `${bugReports.length} bug report(s) in Supabase`}
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {!loading && bugReports.length === 0 && (
              <div className="card p-5 text-sm text-slate-500">
                No bug reports yet. Create your first bug report from the form.
              </div>
            )}

            {bugReports.map((bug) => (
              <article key={bug.id} className="card p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {bug.id.slice(0, 8)} · {bug.module}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {bug.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={priorityBadge(bug.priority)}>
                      {bug.priority}
                    </Badge>
                    <Badge className={severityClass(bug.severity)}>
                      {bug.severity || "Low"}
                    </Badge>
                    <Badge className={bugStatusClass(bug.status)}>
                      {bug.status}
                    </Badge>
                  </div>
                </div>

                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-slate-900">
                      Steps to reproduce
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {bug.steps_to_reproduce || "No steps recorded"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-slate-900">
                      Expected result
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {bug.expected_result || "No expected result"}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold text-slate-900">
                      Actual result
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {bug.actual_result || "No actual result"}
                    </dd>
                  </div>

                  {bug.notes && (
                    <div>
                      <dt className="font-semibold text-slate-900">Notes</dt>
                      <dd className="mt-1 text-slate-600">{bug.notes}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <select
                    disabled={!userCanWrite}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    value={bug.status}
                    onChange={(event) =>
                      updateBugStatus(bug.id, event.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!userCanWrite}
                    onClick={() => deleteBugReport(bug.id)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="card p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Create Bug Report
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Record defects with steps, expected behavior, actual behavior, and priority.
          </p>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createBugReport();
            }}
          >
            <select
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              value={form.module}
              onChange={(event) => updateForm("module", event.target.value)}
            >
              {modules.map((moduleName) => (
                <option key={moduleName}>{moduleName}</option>
              ))}
            </select>

            <input
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Bug title"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />

            <textarea
              disabled={!userCanWrite}
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Steps to reproduce"
              value={form.steps_to_reproduce}
              onChange={(event) =>
                updateForm("steps_to_reproduce", event.target.value)
              }
            />

            <textarea
              disabled={!userCanWrite}
              className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Expected result"
              value={form.expected_result}
              onChange={(event) =>
                updateForm("expected_result", event.target.value)
              }
            />

            <textarea
              disabled={!userCanWrite}
              className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Actual result"
              value={form.actual_result}
              onChange={(event) =>
                updateForm("actual_result", event.target.value)
              }
            />

            <select
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              value={form.severity}
              onChange={(event) => updateForm("severity", event.target.value)}
            >
              {severities.map((severity) => (
                <option key={severity}>{severity}</option>
              ))}
            </select>

            <select
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              value={form.priority}
              onChange={(event) => updateForm("priority", event.target.value)}
            >
              {priorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>

            <select
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <textarea
              disabled={!userCanWrite}
              className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Notes"
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
            />

            <button
              type="submit"
              disabled={saving || !userCanWrite}
              className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : userCanWrite ? "Save Bug Report" : "Read Only"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}