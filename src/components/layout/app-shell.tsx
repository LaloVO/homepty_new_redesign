import { PropsWithChildren } from "react";
import { AppShellProvider } from "@/providers";
import { AppShellLayout } from "@/layouts";
interface Props extends PropsWithChildren {
  leftSidebar: React.ReactNode;
}
export function AppShell({ children, leftSidebar }: Props) {
  return (
    <AppShellProvider>
      <AppShellLayout leftSidebar={leftSidebar}>{children}</AppShellLayout>
    </AppShellProvider>
  );
}
