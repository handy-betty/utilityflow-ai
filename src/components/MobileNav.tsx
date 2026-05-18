import Link from "next/link";

export default function MobileNav() {
  return (
    <div className="border-b border-slate-200 bg-white p-3 lg:hidden">
      <div className="mb-3">
        <p className="text-xs font-medium text-slate-500">UtilityFlow AI</p>
        <p className="text-lg font-bold text-slate-950">Dakota Plains Utility</p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 text-sm">
        {["dashboard", "work-orders", "dispatch", "qa", "bugs", "training", "assistant"].map((path) => (
          <Link className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700" key={path} href={`/${path}`}>
            {path.replace("-", " ")}
          </Link>
        ))}
      </div>
    </div>
  );
}
