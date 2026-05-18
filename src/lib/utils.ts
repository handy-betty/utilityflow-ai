export function statusBadge(status: string) {
  switch (status) {
    case "New":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "Scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "In Progress":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Waiting on Member":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "QA Review":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "Closed":
      return "bg-slate-200 text-slate-700 border-slate-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function priorityBadge(priority: string) {
  switch (priority) {
    case "Low":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "Normal":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "High":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Emergency":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}