"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import { priorityBadge, statusBadge } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

import PermissionNotice from "@/components/PermissionNotice";
import { canWrite } from "@/lib/roles";
import { useUserRole } from "@/lib/useUserRole";

type Technician = {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  active: boolean | null;
  created_at: string | null;
};

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

type WorkOrder = {
  id: string;
  member_id: string | null;
  member_name: string;
  address: string | null;
  type: string;
  priority: string;
  status: string;
  assigned_technician_id: string | null;
  assigned_technician_name: string | null;
  due_date: string | null;
  description: string | null;
  created_at: string | null;
};

const workOrderTypes = [
  "Outage",
  "Meter Issue",
  "Service Request",
  "Install",
  "Inspection",
  "Repair",
  "Billing Support",
];

const priorities = ["Low", "Normal", "High", "Emergency"];

const statuses = [
  "New",
  "Scheduled",
  "In Progress",
  "Waiting on Member",
  "Completed",
  "QA Review",
  "Closed",
];

const emptyForm = {
  member_id: "",
  member_name: "",
  address: "",
  type: "Service Request",
  priority: "Normal",
  assigned_technician_id: "",
  due_date: "",
  description: "",
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const { role } = useUserRole();
  const userCanWrite = canWrite(role);

  async function loadData() {
    setLoading(true);
    setMessage(null);

    const [workOrdersResult, techniciansResult, membersResult] =
      await Promise.all([
        supabase
          .from("work_orders")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("technicians")
          .select("*")
          .eq("active", true)
          .order("name", { ascending: true }),

        supabase
          .from("members")
          .select("*")
          .order("name", { ascending: true }),
      ]);

    if (workOrdersResult.error) {
      setMessage(`Work orders error: ${workOrdersResult.error.message}`);
    } else {
      setWorkOrders(workOrdersResult.data ?? []);
    }

    if (techniciansResult.error) {
      setMessage(`Technicians error: ${techniciansResult.error.message}`);
    } else {
      setTechnicians(techniciansResult.data ?? []);
    }

    if (membersResult.error) {
      setMessage(`Members error: ${membersResult.error.message}`);
    } else {
      setMembers(membersResult.data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredWorkOrders = useMemo(() => {
    if (statusFilter === "All") return workOrders;
    return workOrders.filter((order) => order.status === statusFilter);
  }, [workOrders, statusFilter]);

  function updateForm(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleMemberSelect(memberId: string) {
    if (!memberId) {
      setForm((current) => ({
        ...current,
        member_id: "",
      }));
      return;
    }

    const selectedMember = members.find((member) => member.id === memberId);

    if (!selectedMember) return;

    setForm((current) => ({
      ...current,
      member_id: selectedMember.id,
      member_name: selectedMember.name,
      address: selectedMember.address ?? "",
    }));
  }

  async function createWorkOrder() {
    setMessage(null);
    
    if (!userCanWrite) {
  setMessage("Read-only users cannot create work orders.");
  return;
}

    if (!form.member_name.trim()) {
      setMessage("Member name is required.");
      return;
    }

    if (!form.description.trim()) {
      setMessage("Work description is required.");
      return;
    }

    setSaving(true);

    const selectedTechnician = technicians.find(
      (tech) => tech.id === form.assigned_technician_id
    );

    const { data, error } = await supabase
      .from("work_orders")
      .insert({
        member_id: form.member_id || null,
        member_name: form.member_name.trim(),
        address: form.address.trim() || null,
        type: form.type,
        priority: form.priority,
        status: "New",
        assigned_technician_id: selectedTechnician?.id ?? null,
        assigned_technician_name: selectedTechnician?.name ?? null,
        due_date: form.due_date || null,
        description: form.description.trim(),
      })
      .select()
      .single();

    if (error) {
      setMessage(`Create error: ${error.message}`);
      setSaving(false);
      return;
    }

    if (data) {
      setWorkOrders((current) => [data, ...current]);

      await supabase.from("activity_log").insert({
        module: "Work Orders",
        action: "Created",
        details: `Work order ${data.id} created for ${data.member_name}`,
      });
    }

    setForm(emptyForm);
    setMessage("Work order created successfully.");
    setSaving(false);
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setMessage(null);

    if (!userCanWrite) {
  setMessage("Read-only users cannot update work order status.");
  return;
}

    const { data, error } = await supabase
      .from("work_orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      setMessage(`Status update error: ${error.message}`);
      return;
    }

    setWorkOrders((current) =>
      current.map((order) => (order.id === orderId ? data : order))
    );

    await supabase.from("activity_log").insert({
      module: "Work Orders",
      action: "Status Updated",
      details: `Work order ${orderId} moved to ${newStatus}`,
    });
  }

  async function deleteWorkOrder(orderId: string) {
  if (!userCanWrite) {
    setMessage("Read-only users cannot delete work orders.");
    return;
  }

  const confirmed = window.confirm(
    "Delete this work order? This is only for the demo build."
  );

  if (!confirmed) return;

    const { error } = await supabase
      .from("work_orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      setMessage(`Delete error: ${error.message}`);
      return;
    }

    setWorkOrders((current) =>
      current.filter((order) => order.id !== orderId)
    );

    setMessage("Work order deleted.");
  }

  return (
    <div>
      <PageHeader
        title="Work Orders"
        subtitle="Create, assign, track, and review utility service work from request through closeout."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )} {!userCanWrite && <PermissionNotice />}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                Work Order Queue
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading work orders..."
                  : `${filteredWorkOrders.length} work order(s) shown`}
              </p>
            </div>

            <select
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {!loading && filteredWorkOrders.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
                No work orders yet. Create your first work order from the form.
              </div>
            )}

            {filteredWorkOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {order.id.slice(0, 8)} · {order.member_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.address || "No address entered"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={statusBadge(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge className={priorityBadge(order.priority)}>
                      {order.priority}
                    </Badge>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {order.description || "No description"}
                </p>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-xs text-slate-500">Type</span>
                    {order.type}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-xs text-slate-500">
                      Technician
                    </span>
                    {order.assigned_technician_name ?? "Unassigned"}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="block text-xs text-slate-500">Due</span>
                    {order.due_date ?? "No due date"}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <select
                    disabled={!userCanWrite}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    value={order.status}
                    onChange={(event) =>
                      updateStatus(order.id, event.target.value)
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!userCanWrite}
                    onClick={() => deleteWorkOrder(order.id)}
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
            Create Work Order
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Select an existing member or enter a manual member record.
          </p>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createWorkOrder();
            }}
          >
            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.member_id}
              onChange={(event) => handleMemberSelect(event.target.value)}
            >
              <option value="">Select existing member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.account_number} · {member.name}
                </option>
              ))}
            </select>

            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Member name"
              value={form.member_name}
              onChange={(event) =>
                updateForm("member_name", event.target.value)
              }
            />

            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Service address"
              value={form.address}
              onChange={(event) => updateForm("address", event.target.value)}
            />

            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.type}
              onChange={(event) => updateForm("type", event.target.value)}
            >
              {workOrderTypes.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.priority}
              onChange={(event) => updateForm("priority", event.target.value)}
            >
              {priorities.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>

            <select
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.assigned_technician_id}
              onChange={(event) =>
                updateForm("assigned_technician_id", event.target.value)
              }
            >
              <option value="">Assign technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={form.due_date}
              onChange={(event) => updateForm("due_date", event.target.value)}
            />

            <textarea
              className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Work description"
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
            />

            <button
  type="submit"
  disabled={saving || !userCanWrite}
  className="w-full rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
>
  {saving ? "Saving..." : userCanWrite ? "Save Work Order" : "Read Only"}
</button>
          </form>
        </aside>
      </div>
    </div>
  );
}