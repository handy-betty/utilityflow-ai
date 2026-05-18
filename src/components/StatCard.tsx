export default function StatCard({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}
