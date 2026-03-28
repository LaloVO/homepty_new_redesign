"use client";
import { AppShellContext } from "@/context";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";

export function AppShellProvider({ children }: PropsWithChildren) {
  const [isRightCollapsed, setIsRightCollapsed] = useState<boolean>(false);
  const [rightPanelContent, setRightPanelContent] =
    useState<React.ReactNode | null>(null);

  const toggleSidebarRight = useCallback(() => {
    setIsRightCollapsed((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isRightCollapsed,
      rightPanelContent,
      toggleSidebarRight,
      setIsRightCollapsed,
      setRightPanelContent,
    }),
    [isRightCollapsed, rightPanelContent, toggleSidebarRight],
  );

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
}
