import { AppShell } from "@/components/layout/app-shell";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppShell leftSidebar={<AppSidebar />}>
        {children}
      </AppShell>
      <Toaster position="top-right" richColors={true} />
    </SidebarProvider>
  );
}
