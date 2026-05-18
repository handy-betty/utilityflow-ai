"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import { supabase } from "@/lib/supabaseClient";

type QATestCase = {
  id: string;
  module: string;
  title: string;
  steps: string | null;
  expected_result: string | null;
  actual_result: string | null;
  status: string;
  severity: string | null;
  notes: string | null;
  created_at: string | null;
};

const emptyForm = {
  module: "Work Orders",
  title: "",
  steps: "",
  expected_result: "",
  actual_result: "",
  status: "Not Run",
  severity: "Medium",
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

const statuses = ["Not Run", "Pass", "Fail", "Blocked"];

const severities = ["Low", "Medium", "High", "Critical"];

function statusClass(status: string) {
  if (status === "Pass") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "Fail") return "bg-red-50 text-red-700 border-red-200";
  if (status === "Blocked") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function severityClass(severity: string | null) {
  if (severity === "Critical") return "bg-red-50 text-red-700 border-red-200";
  if (severity === "High") return "bg-orange-50 text-orange-700 border-orange-200";
  if (severity === "Medium") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export default function QAPage() {
  const [testCases, setTestCases] = useState<QATestCase[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadTestCases() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("qa_test_cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Load error: ${error.message}`);
      setLoading(false);
      return;
    }

    setTestCases(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTestCases();
  }, []);

  function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createTestCase() {
    setMessage(null);

    if (!form.title.trim()) {
      setMessage("Test title is required.");
      return;
    }

    if (!form.steps.trim()) {
      setMessage("Test steps are required.");
      return;
    }

    if (!form.expected_result.trim()) {
      setMessage("Expected result is required.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("qa_test_cases")
      .insert({
        module: form.module,
        title: form.title.trim(),
        steps: form.steps.trim(),
        expected_result: form.expected_result.trim(),
        actual_result: form.actual_result.trim() || null,
        status: form.status,
        severity: form.severity,
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
      setTestCases((current) => [data, ...current]);

      await supabase.from("activity_log").insert({
        module: "QA Testing",
        action: "Test Case Created",
        details: `QA test case created for ${data.module}: ${data.title}`,
      });
    }

    setForm(emptyForm);
    setMessage("QA test case created.");
    setSaving(false);
  }

  async function updateStatus(testCaseId: string, status: string) {
    setMessage(null);

    const { data, error } = await supabase
      .from("qa_test_cases")
      .update({ status })
      .eq("id", testCaseId)
      .select()
      .single();

    if (error) {
      setMessage(`Status update error: ${error.message}`);
      return;
    }

    setTestCases((current) =>
      current.map((testCase) => (testCase.id === testCaseId ? data : testCase))
    );

    await supabase.from("activity_log").insert({
      module: "QA Testing",
      action: "Status Updated",
      details: `QA test case ${testCaseId} updated to ${status}`,
    });
  }

  async function deleteTestCase(testCaseId: string) {
    const confirmed = window.confirm(
      "Delete this QA test case? This is only for the demo build."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("qa_test_cases")
      .delete()
      .eq("id", testCaseId);

    if (error) {
      setMessage(`Delete error: ${error.message}`);
      return;
    }

    setTestCases((current) =>
      current.filter((testCase) => testCase.id !== testCaseId)
    );

    setMessage("QA test case deleted.");
  }

  return (
    <div>
      <PageHeader
        title="QA Testing Center"
        subtitle="Manual QA test cases proving testing discipline, documentation, and release readiness."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Test Case Register
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading QA test cases..."
                  : `${testCases.length} test case(s) in Supabase`}
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Manual QA evidence for DVR portfolio
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-3">ID</th>
                  <th>Module</th>
                  <th>Title / Steps</th>
                  <th>Expected</th>
                  <th>Actual</th>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!loading && testCases.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-sm text-slate-500">
                      No test cases yet. Create your first QA test case from the form.
                    </td>
                  </tr>
                )}

                {testCases.map((test) => (
                  <tr key={test.id} className="align-top">
                    <td className="py-3 font-semibold text-slate-900">
                      {test.id.slice(0, 8)}
                    </td>

                    <td>{test.module}</td>

                    <td className="max-w-xs">
                      <p className="font-semibold text-slate-900">{test.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {test.steps || "No steps entered"}
                      </p>
                    </td>

                    <td className="max-w-sm text-slate-600">
                      {test.expected_result || "No expected result"}
                    </td>

                    <td className="max-w-sm text-slate-600">
                      {test.actual_result || "Not tested yet"}
                    </td>

                    <td>
                      <div className="space-y-2">
                        <Badge className={statusClass(test.status)}>
                          {test.status}
                        </Badge>

                        <select
                          className="block w-full rounded-xl border border-slate-200 px-2 py-1 text-xs"
                          value={test.status}
                          onChange={(event) =>
                            updateStatus(test.id, event.target.value)
                          }
                        >
                          {statuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td>
                      <Badge className={severityClass(test.severity)}>
                        {test.severity || "Low"}
                      </Badge>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => deleteTestCase(test.id)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="card p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Create QA Test Case
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Document how a feature should behave, what was tested, and whether it passed.
          </p>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createTestCase();
            }}
          >
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.module}
              onChange={(event) => updateForm("module", event.target.value)}
            >
              {modules.map((moduleName) => (
                <option key={moduleName}>{moduleName}</option>
              ))}
            </select>

            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Test title"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />

            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Steps to test"
              value={form.steps}
              onChange={(event) => updateForm("steps", event.target.value)}
            />

            <textarea
              className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Expected result"
              value={form.expected_result}
              onChange={(event) =>
                updateForm("expected_result", event.target.value)
              }
            />

            <textarea
              className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Actual result"
              value={form.actual_result}
              onChange={(event) =>
                updateForm("actual_result", event.target.value)
              }
            />

            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.severity}
              onChange={(event) => updateForm("severity", event.target.value)}
            >
              {severities.map((severity) => (
                <option key={severity}>{severity}</option>
              ))}
            </select>

            <textarea
              className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Notes"
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save QA Test Case"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}