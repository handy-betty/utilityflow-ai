import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  KanbanSquare,
  LockKeyhole,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import UtilityFlowHero3D from "@/components/UtilityFlowHero3D";

const modules = [
  {
    title: "Members",
    description: "Customer/member records tied directly to work order intake.",
    icon: Users,
  },
  {
    title: "Work Orders",
    description: "Create, assign, track, and review operational work requests.",
    icon: Wrench,
  },
  {
    title: "Dispatch Board",
    description: "Move jobs through New, Scheduled, In Progress, QA Review, and Closed.",
    icon: KanbanSquare,
  },
  {
    title: "QA Testing",
    description: "Document test cases, expected results, actual results, and pass/fail status.",
    icon: ClipboardCheck,
  },
  {
    title: "Bug Reports",
    description: "Track defects with reproduction steps, severity, priority, and status.",
    icon: Bug,
  },
  {
    title: "AI Help",
    description: "Controlled help assistant that answers from internal training documents.",
    icon: Bot,
  },
];

const proofPoints = [
  "Next.js / TypeScript frontend",
  "Supabase database backend",
  "Vercel production deployment",
  "Login/authentication",
  "Protected routes",
  "Role-based access",
  "Read-only demo permissions",
  "Work-order workflow design",
  "QA test case documentation",
  "Bug tracking process",
  "Release notes",
  "Training documentation",
];

const demoFlow = [
  "Login with read-only demo credentials",
  "View the live operations dashboard",
  "Open member/customer records",
  "Review work orders and dispatch status",
  "Inspect QA test cases and bug reports",
  "Read training documentation",
  "Ask the controlled AI help assistant",
  "Review release notes and implementation history",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),_transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-100">
              <ShieldCheck className="h-4 w-4" />
              Live portfolio software demo
            </div>

            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              UtilityFlow AI
              <span className="block text-blue-300">
                Operations software built to prove implementation, QA, and project workflow skills.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A working web application demonstrating member records, work orders,
              dispatch workflow, QA testing, bug reports, training documentation,
              release notes, role-based access, and controlled AI support.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-400"
              >
                View Live Demo
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#demo-access"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Demo Login Details
              </a>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">10+</p>
                <p className="mt-1">connected modules</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">Live</p>
                <p className="mt-1">Supabase data</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-black text-white">Secure</p>
                <p className="mt-1">role-based access</p>
              </div>
            </div>
          </div>

          <UtilityFlowHero3D />
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-300">
            What this project demonstrates
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              A real workflow system, not just a static mockup.
            </h2>

            <p className="text-base leading-8 text-slate-300">
              UtilityFlow AI was built as a working portfolio project to show a
              practical transition path into project management, software
              implementation, QA testing, business systems support, training
              documentation, and AI-assisted support workflows.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-300">
              Live modules
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              Explore the system
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Each module is connected to the broader operational workflow and
            protected with login, route protection, role permissions, and
            read-only demo controls.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <div
                key={module.title}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/10"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-white">
                  {module.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {module.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-900/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-300">
              Skills proven
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              Built to support a PMP / implementation direction.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The project is designed to support a transition toward project
              coordination, project management, software implementation, QA,
              business systems, training, and support roles.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-200"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-300" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo-access" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-blue-300/20 bg-blue-500/10 p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200">
              <LockKeyhole className="h-6 w-6" />
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white">
              Demo access
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Use read-only credentials when sharing the demo with employers,
              counselors, or reviewers. Read-only access allows the system to be
              explored without changing live data.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-5 font-mono text-sm text-slate-200">
              <p>Email: demo@utilityflow.gosenterprises.com</p>
              <p className="mt-2">Password: DemoAccess123!</p>
              <p className="mt-2 text-blue-300">Role: Read Only</p>
            </div>

            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400"
            >
              Open Login Page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-300">
              Suggested review flow
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
              Five-minute walkthrough
            </h2>

            <div className="mt-6 space-y-3">
              {demoFlow.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-6 text-slate-300">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-blue-300">
              UtilityFlow AI
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              A live portfolio project demonstrating operational workflow design,
              project implementation, quality testing, documentation, and
              responsible AI-assisted support.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-950 hover:bg-blue-100"
          >
            View Demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}