"use client";
import { RightPanel } from "@/components/layout";
import { useAppShell } from "@/hooks";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
interface Props extends PropsWithChildren {
  leftSidebar: React.ReactNode;
}
export function AppShellLayout({ children, leftSidebar }: Props) {
  const { isRightCollapsed, setRightPanelContent } = useAppShell();

  return (
    <div
      className="grid h-screen w-full overflow-hidden bg-[var(--background-light)] transition-all duration-300 ease-app-shell"
      style={{
        gridTemplateColumns: `auto 1fr ${isRightCollapsed ? "0px" : "320px"}`,
      }}
    >
      {/* Left */}
      <div className="h-full overflow-hidden z-20">{leftSidebar}</div>

      {/* Main */}
      <main className="surface-container ...">{children}</main>

      {/* Right */}
      <div
        className={cn(
          "hidden xl:block h-full transition-all duration-300 overflow-hidden",
          isRightCollapsed ? "w-0 opacity-0" : "w-[320px] opacity-100",
        )}
      >
        <RightPanel />
      </div>
    </div>
  );
}
