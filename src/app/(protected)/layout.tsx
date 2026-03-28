import { AppShell } from "@/components/layout/app-shell";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ActivityTracker } from "@/components/layout/activity-tracker";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <ActivityTracker />
      <AppShell leftSidebar={<AppSidebar />}>
        {children}
      </AppShell>
      <Toaster position="top-right" richColors={true} />
    </SidebarProvider>
  );
}

