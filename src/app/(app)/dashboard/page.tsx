"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import { priorityBadge, statusBadge } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";

type WorkOrder = {
  id: string;
  member_name: string;
  type: string;
  priority: string;
  status: string;
  assigned_technician_name: string | null;
  created_at: string | null;
};

type ActivityLog = {
  id: string;
  module: string;
  action: string;
  details: string | null;
  created_at: string | null;
};

export default function DashboardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [technicianCount, setTechnicianCount] = useState(0);
  const [qaTestCount, setQaTestCount] = useState(0);
  const [bugCount, setBugCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadDashboardData() {
    setLoading(true);
    setMessage(null);

    const [
      workOrdersResult,
      membersResult,
      techniciansResult,
      qaResult,
      bugsResult,
      activityResult,
    ] = await Promise.all([
      supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("members")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("technicians")
        .select("*", { count: "exact", head: true })
        .eq("active", true),

      supabase
        .from("qa_test_cases")
        .select("*", { count: "exact", head: true })
        .eq("status", "Fail"),

      supabase
        .from("bug_reports")
        .select("*", { count: "exact", head: true })
        .neq("status", "Closed"),

      supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    if (workOrdersResult.error) {
      setMessage(`Work orders error: ${workOrdersResult.error.message}`);
    } else {
      setWorkOrders(workOrdersResult.data ?? []);
    }

    if (membersResult.error) {
      setMessage(`Members count error: ${membersResult.error.message}`);
    } else {
      setMemberCount(membersResult.count ?? 0);
    }

    if (techniciansResult.error) {
      setMessage(`Technicians count error: ${techniciansResult.error.message}`);
    } else {
      setTechnicianCount(techniciansResult.count ?? 0);
    }

    if (qaResult.error) {
      setMessage(`QA count error: ${qaResult.error.message}`);
    } else {
      setQaTestCount(qaResult.count ?? 0);
    }

    if (bugsResult.error) {
      setMessage(`Bug count error: ${bugsResult.error.message}`);
    } else {
      setBugCount(bugsResult.count ?? 0);
    }

    if (activityResult.error) {
      setMessage(`Activity log error: ${activityResult.error.message}`);
    } else {
      setActivityLog(activityResult.data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const openWorkOrders = useMemo(() => {
    return workOrders.filter(
      (order) => !["Closed", "Completed"].includes(order.status)
    ).length;
  }, [workOrders]);

  const qaReview = useMemo(() => {
    return workOrders.filter((order) => order.status === "QA Review").length;
  }, [workOrders]);

  const emergencyWorkOrders = useMemo(() => {
    return workOrders.filter((order) => order.priority === "Emergency").length;
  }, [workOrders]);

  const recentWorkOrders = workOrders.slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Operations Dashboard"
        subtitle="Live Supabase dashboard showing work management, dispatch, QA, training, and responsible AI support."
      />

      {message && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      )}

      {loading && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Loading live dashboard data...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open Work Orders"
          value={openWorkOrders}
          note="Active work not yet completed or closed"
        />
        <StatCard
          label="QA Review"
          value={qaReview}
          note="Completed jobs awaiting quality review"
        />
        <StatCard
          label="Emergency"
          value={emergencyWorkOrders}
          note="High urgency member/service issues"
        />
        <StatCard
          label="Open Bugs"
          value={bugCount}
          note="Bug reports not yet closed"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Members"
          value={memberCount}
          note="Customer/member records in Supabase"
        />
        <StatCard
          label="Active Technicians"
          value={technicianCount}
          note="Assignable field/service users"
        />
        <StatCard
          label="Failed QA Tests"
          value={qaTestCount}
          note="Failed test cases requiring follow-up"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-950">
              Recent Work Orders
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Live Supabase data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-3">ID</th>
                  <th>Member</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Technician</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentWorkOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-sm text-slate-500">
                      No work orders yet.
                    </td>
                  </tr>
                )}

                {recentWorkOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 font-semibold text-slate-900">
                      {order.id.slice(0, 8)}
                    </td>
                    <td>{order.member_name}</td>
                    <td>{order.type}</td>
                    <td>
                      <Badge className={statusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td>
                      <Badge className={priorityBadge(order.priority)}>
                        {order.priority}
                      </Badge>
                    </td>
                    <td>{order.assigned_technician_name ?? "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            Recent Activity
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Audit-style log showing work order and dispatch actions.
          </p>

          <div className="mt-4 space-y-3">
            {activityLog.length === 0 && (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                No activity logged yet. Move a work order status to create
                activity.
              </p>
            )}

            {activityLog.map((activity) => (
              <div key={activity.id} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">
                  {activity.module} · {activity.action}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {activity.details ?? "No details recorded"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {activity.created_at
                    ? new Date(activity.created_at).toLocaleString()
                    : "No timestamp"}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <h3 className="text-lg font-semibold text-slate-950">
          DVR Portfolio Purpose
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          This project demonstrates a realistic retraining direction: software
          implementation, project coordination, QA testing, business systems,
          documentation, and AI-assisted support.
        </p>

        <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
          <p className="rounded-xl bg-slate-50 p-3">
            ✓ Workflow analysis and work-order process design
          </p>
          <p className="rounded-xl bg-slate-50 p-3">
            ✓ Supabase-backed member, technician, and work-order records
          </p>
          <p className="rounded-xl bg-slate-50 p-3">
            ✓ Dispatch status tracking with activity logging
          </p>
          <p className="rounded-xl bg-slate-50 p-3">
            ✓ QA test cases, bug reports, and release notes
          </p>
          <p className="rounded-xl bg-slate-50 p-3">
            ✓ Training documentation and go-live planning
          </p>
          <p className="rounded-xl bg-slate-50 p-3">
            ✓ AI help assistant based on controlled documentation
          </p>
        </div>
      </section>
    </div>
  );
}