"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabaseClient";
import PermissionNotice from "@/components/PermissionNotice";
import { canWrite } from "@/lib/roles";
import { useUserRole } from "@/lib/useUserRole";

type Member = {
  id: string;
  account_number: string;
  name: string;
  service_type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string | null;
};

const emptyForm = {
  account_number: "",
  name: "",
  service_type: "Electric",
  phone: "",
  email: "",
  address: "",
};

const serviceTypes = [
  "Electric",
  "Broadband",
  "Water",
  "Gas",
  "Electric + Broadband",
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { role } = useUserRole();
  const userCanWrite = canWrite(role);

  async function loadMembers() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Load error: ${error.message}`);
      setLoading(false);
      return;
    }

    setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createMember() {
    setMessage(null);

    if (!userCanWrite) {
      setMessage("Read-only users cannot create members.");
      return;
    }

    if (!form.account_number.trim()) {
      setMessage("Account number is required.");
      return;
    }

    if (!form.name.trim()) {
      setMessage("Member name is required.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("members")
      .insert({
        account_number: form.account_number.trim(),
        name: form.name.trim(),
        service_type: form.service_type,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
      })
      .select()
      .single();

    if (error) {
      setMessage(`Create error: ${error.message}`);
      setSaving(false);
      return;
    }

    if (data) {
      setMembers((current) => [data, ...current]);

      await supabase.from("activity_log").insert({
        module: "Members",
        action: "Member Created",
        details: `Member ${data.name} was created.`,
      });
    }

    setForm(emptyForm);
    setMessage("Member created successfully.");
    setSaving(false);
  }

  async function deleteMember(memberId: string) {
    if (!userCanWrite) {
      setMessage("Read-only users cannot delete members.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this member? This is only for the demo build."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", memberId);

    if (error) {
      setMessage(`Delete error: ${error.message}`);
      return;
    }

    setMembers((current) => current.filter((member) => member.id !== memberId));
    setMessage("Member deleted.");
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Member/customer records for a utility or broadband cooperative."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {!userCanWrite && <PermissionNotice />}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card overflow-hidden xl:col-span-2">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-lg font-semibold text-slate-950">
              Member Records
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading members..."
                : `${members.length} member(s) in Supabase`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="p-4">Account</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {!loading && members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-sm text-slate-500">
                      No members yet. Create your first member from the form.
                    </td>
                  </tr>
                )}

                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="p-4 font-semibold text-slate-900">
                      {member.account_number}
                    </td>

                    <td className="p-4">{member.name}</td>

                    <td className="p-4">{member.service_type}</td>

                    <td className="p-4">
                      {member.phone || "No phone"}
                      <br />
                      <span className="text-xs text-slate-500">
                        {member.email || "No email"}
                      </span>
                    </td>

                    <td className="p-4">{member.address || "No address"}</td>

                    <td className="p-4">
                      <button
                        type="button"
                        disabled={!userCanWrite}
                        onClick={() => deleteMember(member.id)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
            Create Member
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Add mock member/customer records to support work order intake and
            dispatch workflows.
          </p>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createMember();
            }}
          >
            <input
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Account number, e.g. M-1001"
              value={form.account_number}
              onChange={(event) =>
                updateForm("account_number", event.target.value)
              }
            />

            <input
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Member name"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
            />

            <select
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              value={form.service_type}
              onChange={(event) =>
                updateForm("service_type", event.target.value)
              }
            >
              {serviceTypes.map((serviceType) => (
                <option key={serviceType}>{serviceType}</option>
              ))}
            </select>

            <input
              disabled={!userCanWrite}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Phone"
              value={form.phone}
              onChange={(event) => updateForm("phone", event.target.value)}
            />

            <input
              disabled={!userCanWrite}
              type="email"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Email"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
            />

            <textarea
              disabled={!userCanWrite}
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Service address"
              value={form.address}
              onChange={(event) => updateForm("address", event.target.value)}
            />

            <button
              type="submit"
              disabled={saving || !userCanWrite}
              className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : userCanWrite ? "Save Member" : "Read Only"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}