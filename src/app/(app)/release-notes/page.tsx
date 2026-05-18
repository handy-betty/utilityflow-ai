"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import PermissionNotice from "@/components/PermissionNotice";
import { supabase } from "@/lib/supabaseClient";
import { canWrite } from "@/lib/roles";
import { useUserRole } from "@/lib/useUserRole";

type ReleaseNote = {
  id: string;
  version: string;
  title: string;
  summary: string | null;
  new_features: string | null;
  fixed_bugs: string | null;
  known_issues: string | null;
  qa_status: string;
  release_date: string | null;
  created_at: string | null;
};

const emptyForm = {
  version: "0.1.0",
  title: "",
  summary: "",
  new_features: "",
  fixed_bugs: "",
  known_issues: "",
  qa_status: "Draft",
  release_date: new Date().toISOString().slice(0, 10),
};

const qaStatuses = ["Draft", "In QA", "Approved", "Released", "Needs Fixes"];

function qaStatusClass(status: string) {
  if (status === "Released") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Approved") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "In QA") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "Needs Fixes") return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function ReleaseNotesPage() {
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { role } = useUserRole();
  const userCanWrite = canWrite(role);

  async function loadReleaseNotes() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("release_notes")
      .select("*")
      .order("release_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Load error: ${error.message}`);
      setLoading(false);
      return;
    }

    setReleaseNotes(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadReleaseNotes();
  }, []);

  function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createReleaseNote() {
    setMessage(null);

    if (!userCanWrite) {
      setMessage("Read-only users cannot create release notes.");
      return;
    }

    if (!form.version.trim()) {
      setMessage("Version is required.");
      return;
    }

    if (!form.title.trim()) {
      setMessage("Release title is required.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("release_notes")
      .insert({
        version: form.version.trim(),
        title: form.title.trim(),
        summary: form.summary.trim() || null,
        new_features: form.new_features.trim() || null,
        fixed_bugs: form.fixed_bugs.trim() || null,
        known_issues: form.known_issues.trim() || null,
        qa_status: form.qa_status,
        release_date: form.release_date || null,
      })
      .select()
      .single();

    if (error) {
      setMessage(`Create error: ${error.message}`);
      setSaving(false);
      return;
    }

    if (data) {
      setReleaseNotes((current) => [data, ...current]);

      await supabase.from("activity_log").insert({
        module: "Release Notes",
        action: "Release Note Created",
        details: `Release ${data.version} created: ${data.title}`,
      });
    }

    setForm(emptyForm);
    setMessage("Release note created.");
    setSaving(false);
  }

  async function updateQAStatus(releaseId: string, qaStatus: string) {
    setMessage(null);

    if (!userCanWrite) {
      setMessage("Read-only users cannot update release note QA status.");
      return;
    }

    const { data, error } = await supabase
      .from("release_notes")
      .update({ qa_status: qaStatus })
      .eq("id", releaseId)
      .select()
      .single();

    if (error) {
      setMessage(`Status update error: ${error.message}`);
      return;
    }

    setReleaseNotes((current) =>
      current.map((release) => (release.id === releaseId ? data : release))
    );

    await supabase.from("activity_log").insert({
      module: "Release Notes",
      action: "QA Status Updated",
      details: `Release ${data.version} updated to ${qaStatus}`,
    });
  }

  async function deleteReleaseNote(releaseId: string) {
    if (!userCanWrite) {
      setMessage("Read-only users cannot delete release notes.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this release note? This is only for the demo build."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("release_notes")
      .delete()
      .eq("id", releaseId);

    if (error) {
      setMessage(`Delete error: ${error.message}`);
      return;
    }

    setReleaseNotes((current) =>
      current.filter((release) => release.id !== releaseId)
    );

    setMessage("Release note deleted.");
  }

  async function seedFirstRelease() {
    setMessage(null);

    if (!userCanWrite) {
      setMessage("Read-only users cannot add starter release notes.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("release_notes")
      .insert({
        version: "0.1.0",
        title: "Supabase Work Management MVP",
        summary:
          "Initial database-backed MVP for UtilityFlow AI showing member records, work orders, dispatch workflow, QA testing, bug tracking, training docs, and controlled AI help.",
        new_features:
          "- Member records connected to Supabase\n- Technician assignment dropdown\n- Work order creation with member auto-fill\n- Dispatch board with live status updates\n- Activity logging\n- Live dashboard metrics\n- QA test case tracking\n- Bug report tracking\n- Training document library\n- Controlled AI help assistant using training docs",
        fixed_bugs:
          "- Replaced local demo data with Supabase-backed modules\n- Fixed missing QA notes column\n- Updated badge utilities for Supabase string values\n- Fixed lucide-react icon import issue",
        known_issues:
          "- Authentication not yet enabled\n- Role-based access not yet enabled\n- Public demo security hardening pending\n- Release notes module is still being tested",
        qa_status: "In QA",
        release_date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) {
      setMessage(`Seed error: ${error.message}`);
      setSaving(false);
      return;
    }

    if (data) {
      setReleaseNotes((current) => [data, ...current]);

      await supabase.from("activity_log").insert({
        module: "Release Notes",
        action: "Starter Release Added",
        details: "Starter release note for version 0.1.0 was added.",
      });
    }

    setMessage("Starter release note added.");
    setSaving(false);
  }

  return (
    <div>
      <PageHeader
        title="Release Notes"
        subtitle="Version history, QA status, fixed bugs, known issues, and implementation release documentation."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {!userCanWrite && <PermissionNotice />}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Release Register
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading release notes..."
                  : `${releaseNotes.length} release note(s) in Supabase`}
              </p>
            </div>

            <button
              type="button"
              onClick={seedFirstRelease}
              disabled={saving || !userCanWrite}
              className="rounded-xl border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : userCanWrite ? "Add Starter Release" : "Read Only"}
            </button>
          </div>

          <div className="space-y-4">
            {!loading && releaseNotes.length === 0 && (
              <div className="card p-5 text-sm text-slate-500">
                No release notes yet. Create one manually or click Add Starter
                Release.
              </div>
            )}

            {releaseNotes.map((release) => (
              <article key={release.id} className="card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
                      Version {release.version}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {release.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Release date: {release.release_date ?? "No date"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={qaStatusClass(release.qa_status)}>
                      {release.qa_status}
                    </Badge>
                  </div>
                </div>

                {release.summary && (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {release.summary}
                  </p>
                )}

                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold text-slate-950">
                      New Features
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {release.new_features || "No new features recorded."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold text-slate-950">
                      Fixed Bugs
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {release.fixed_bugs || "No fixed bugs recorded."}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold text-slate-950">
                      Known Issues
                    </h4>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {release.known_issues || "No known issues recorded."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <select
                    disabled={!userCanWrite}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    value={release.qa_status}
                    onChange={(event) =>
                      updateQAStatus(release.id, event.target.value)
                    }
                  >
                    {qaStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!userCanWrite}
                    onClick={() => deleteReleaseNote(release.id)}
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
            Create Release Note
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Document version changes, QA status, fixes, and known issues before
            demo or deployment.
          </p>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createReleaseNote();
            }}
          >
            <input
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Version, e.g. 0.1.0"
              value={form.version}
              onChange={(event) => updateForm("version", event.target.value)}
            />

            <input
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Release title"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />

            <textarea
              disabled={!userCanWrite}
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Summary"
              value={form.summary}
              onChange={(event) => updateForm("summary", event.target.value)}
            />

            <textarea
              disabled={!userCanWrite}
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="New features"
              value={form.new_features}
              onChange={(event) =>
                updateForm("new_features", event.target.value)
              }
            />

            <textarea
              disabled={!userCanWrite}
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Fixed bugs"
              value={form.fixed_bugs}
              onChange={(event) => updateForm("fixed_bugs", event.target.value)}
            />

            <textarea
              disabled={!userCanWrite}
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Known issues"
              value={form.known_issues}
              onChange={(event) =>
                updateForm("known_issues", event.target.value)
              }
            />

            <select
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              value={form.qa_status}
              onChange={(event) => updateForm("qa_status", event.target.value)}
            >
              {qaStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <input
              disabled={!userCanWrite}
              type="date"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              value={form.release_date}
              onChange={(event) =>
                updateForm("release_date", event.target.value)
              }
            />

            <button
              type="submit"
              disabled={saving || !userCanWrite}
              className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : userCanWrite ? "Save Release Note" : "Read Only"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}