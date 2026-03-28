"use client";
import { TABS_CRM } from "@/utils/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionTabsCrm() {
  const pathname = usePathname();

  return (
    <div className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500">
      {TABS_CRM.map((tab) => (
        <Link
          key={tab.value}
          href={tab.href}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            pathname === tab.href && "bg-white text-slate-900 shadow-sm border border-slate-200/50"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
