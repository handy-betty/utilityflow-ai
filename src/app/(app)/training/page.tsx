"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabaseClient";

type TrainingDoc = {
  id: string;
  category: string;
  title: string;
  content: string;
  created_at: string | null;
};

const emptyForm = {
  category: "Work Orders",
  title: "",
  content: "",
};

const categories = [
  "Work Orders",
  "Dispatch",
  "QA Testing",
  "Bug Reports",
  "Go-Live",
  "Support",
  "AI Help",
];

const checklistItems = [
  "Confirm core workflows were tested",
  "Verify user roles and permissions",
  "Complete dispatch and QA training",
  "Document known issues and workarounds",
  "Prepare support escalation contacts",
  "Schedule go-live support window",
];

export default function TrainingPage() {
  const [docs, setDocs] = useState<TrainingDoc[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");

  async function loadDocs() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("training_docs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Load error: ${error.message}`);
      setLoading(false);
      return;
    }

    setDocs(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadDocs();
  }, []);

  const filteredDocs = useMemo(() => {
    if (categoryFilter === "All") return docs;
    return docs.filter((doc) => doc.category === categoryFilter);
  }, [docs, categoryFilter]);

  function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createDoc() {
    setMessage(null);

    if (!form.title.trim()) {
      setMessage("Training title is required.");
      return;
    }

    if (!form.content.trim()) {
      setMessage("Training content is required.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("training_docs")
      .insert({
        category: form.category,
        title: form.title.trim(),
        content: form.content.trim(),
      })
      .select()
      .single();

    if (error) {
      setMessage(`Create error: ${error.message}`);
      setSaving(false);
      return;
    }

    if (data) {
      setDocs((current) => [data, ...current]);

      await supabase.from("activity_log").insert({
        module: "Training Docs",
        action: "Training Doc Created",
        details: `Training document created: ${data.title}`,
      });
    }

    setForm(emptyForm);
    setMessage("Training document created.");
    setSaving(false);
  }

  async function deleteDoc(docId: string) {
    const confirmed = window.confirm(
      "Delete this training document? This is only for the demo build."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("training_docs")
      .delete()
      .eq("id", docId);

    if (error) {
      setMessage(`Delete error: ${error.message}`);
      return;
    }

    setDocs((current) => current.filter((doc) => doc.id !== docId));
    setMessage("Training document deleted.");
  }

  async function seedStarterDocs() {
    setMessage(null);
    setSaving(true);

    const starterDocs = [
      {
        category: "Work Orders",
        title: "How to Create a Work Order",
        content:
          "Open Work Orders, select an existing member or enter a manual member record, choose the work type and priority, assign a technician if known, enter a due date and description, then save the work order. New work orders begin in New status.",
      },
      {
        category: "Dispatch",
        title: "How to Move Work Through Dispatch",
        content:
          "Open the Dispatch Board and review the work order under its current status. Use the Move button or status dropdown to advance the work order from New to Scheduled, In Progress, Completed, QA Review, and Closed.",
      },
      {
        category: "QA Testing",
        title: "How QA Review Works",
        content:
          "QA review confirms that the workflow behaved as expected. Create a test case, document the steps, expected result, actual result, and mark the status as Pass, Fail, Blocked, or Not Run.",
      },
      {
        category: "Bug Reports",
        title: "How to Submit a Bug Report",
        content:
          "When a test fails, open Bug Reports and document the module, bug title, steps to reproduce, expected result, actual result, severity, priority, and current status.",
      },
      {
        category: "Go-Live",
        title: "Go-Live Readiness Checklist",
        content:
          "Before go-live, confirm core workflows were tested, user training was completed, known issues were documented, escalation contacts were prepared, and a support window was scheduled.",
      },
      {
        category: "Support",
        title: "Support Handoff Process",
        content:
          "After go-live, summarize open issues, known workarounds, unresolved bugs, user questions, and escalation paths before transitioning the customer to support.",
      },
    ];

    const { data, error } = await supabase
      .from("training_docs")
      .insert(starterDocs)
      .select();

    if (error) {
      setMessage(`Seed error: ${error.message}`);
      setSaving(false);
      return;
    }

    setDocs((current) => [...(data ?? []), ...current]);

    await supabase.from("activity_log").insert({
      module: "Training Docs",
      action: "Starter Docs Added",
      details: "Starter training and go-live documents were added.",
    });

    setMessage("Starter training documents added.");
    setSaving(false);
  }

  return (
    <div>
      <PageHeader
        title="Training & Go-Live Docs"
        subtitle="User-facing training material and implementation support documentation."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Training Library
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading training docs..."
                  : `${filteredDocs.length} training document(s) shown`}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={seedStarterDocs}
                disabled={saving}
                className="rounded-xl border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
              >
                Add Starter Docs
              </button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {!loading && filteredDocs.length === 0 && (
              <div className="card p-5 text-sm text-slate-500">
                No training documents yet. Create one manually or click Add
                Starter Docs.
              </div>
            )}

            {filteredDocs.map((doc) => (
              <article key={doc.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
                      {doc.category}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {doc.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteDoc(doc.id)}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {doc.content}
                </p>
              </article>
            ))}
          </div>
        </section>

        <aside className="card p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Create Training Doc
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add user-facing help content that can later power the AI help
            assistant.
          </p>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createDoc();
            }}
          >
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.category}
              onChange={(event) => updateForm("category", event.target.value)}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Training title"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />

            <textarea
              className="min-h-40 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Training content"
              value={form.content}
              onChange={(event) => updateForm("content", event.target.value)}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Training Doc"}
            </button>
          </form>
        </aside>
      </div>

      <section className="card mt-6 p-5">
        <h3 className="text-lg font-semibold text-slate-950">
          Implementation Go-Live Checklist
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          Checklist used to show implementation readiness before transitioning a
          member/customer to support.
        </p>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          {checklistItems.map((item) => (
            <label
              key={item}
              className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
            >
              <input type="checkbox" />
              {item}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}