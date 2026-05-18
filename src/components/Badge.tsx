import { classNames } from "@/lib/utils";

export default function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={classNames("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", className)}>{children}</span>;
}
