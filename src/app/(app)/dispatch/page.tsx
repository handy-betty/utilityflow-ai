"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Badge from "@/components/Badge";
import { statusBadge, priorityBadge } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

type WorkOrder = {
  id: string;
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

const statuses = [
  "New",
  "Scheduled",
  "In Progress",
  "Waiting on Member",
  "Completed",
  "QA Review",
  "Closed",
];

const nextStatusMap: Record<string, string | null> = {
  New: "Scheduled",
  Scheduled: "In Progress",
  "In Progress": "Completed",
  "Waiting on Member": "Scheduled",
  Completed: "QA Review",
  "QA Review": "Closed",
  Closed: null,
};

export default function DispatchPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadWorkOrders() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("work_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`Load error: ${error.message}`);
      setLoading(false);
      return;
    }

    setWorkOrders(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const groupedWorkOrders = useMemo(() => {
    return statuses.reduce<Record<string, WorkOrder[]>>((groups, status) => {
      groups[status] = workOrders.filter((order) => order.status === status);
      return groups;
    }, {});
  }, [workOrders]);

  async function updateStatus(order: WorkOrder, newStatus: string) {
    setMessage(null);

    const { data, error } = await supabase
      .from("work_orders")
      .update({ status: newStatus })
      .eq("id", order.id)
      .select()
      .single();

    if (error) {
      setMessage(`Status update error: ${error.message}`);
      return;
    }

    setWorkOrders((current) =>
      current.map((item) => (item.id === order.id ? data : item))
    );

    await supabase.from("activity_log").insert({
      module: "Dispatch",
      action: "Status Updated",
      details: `Work order ${order.id} moved from ${order.status} to ${newStatus}`,
    });

    setMessage(`Work order moved to ${newStatus}.`);
  }

  return (
    <div>
      <PageHeader
        title="Dispatch Board"
        subtitle="A field-service workflow board showing how work moves from intake through QA and closeout."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {loading ? (
        <div className="card p-5 text-sm text-slate-600">
          Loading dispatch board...
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-7">
          {statuses.map((status) => {
            const orders = groupedWorkOrders[status] ?? [];

            return (
              <section key={status} className="card min-h-80 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {status}
                  </h3>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {orders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {orders.map((order) => {
                    const nextStatus = nextStatusMap[order.status];

                    return (
                      <article
                        key={order.id}
                        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                      >
                        <p className="text-xs font-bold text-slate-500">
                          {order.id.slice(0, 8)}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-950">
                          {order.member_name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {order.address || "No address entered"}
                        </p>

                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                          {order.description || "No description"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge className={priorityBadge(order.priority)}>
                            {order.priority}
                          </Badge>

                          <Badge className={statusBadge(order.status)}>
                            {order.type}
                          </Badge>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                          Tech: {order.assigned_technician_name ?? "Unassigned"}
                        </p>

                        <div className="mt-3 space-y-2">
                          {nextStatus && (
                            <button
                              type="button"
                              onClick={() => updateStatus(order, nextStatus)}
                              className="w-full rounded-xl bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800"
                            >
                              Move to {nextStatus}
                            </button>
                          )}

                          <select
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                            value={order.status}
                            onChange={(event) =>
                              updateStatus(order, event.target.value)
                            }
                          >
                            {statuses.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                      </article>
                    );
                  })}

                  {orders.length === 0 && (
                    <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                      No work orders in this status.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}