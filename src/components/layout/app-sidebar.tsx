import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { HeaderSidebar } from "./header-sidebar";
import { NavUser } from "./nav-user";
import { SIDEBAR_ITEMS } from "@/utils/sidebar";
import { SidebarItem } from "./sidebar-item";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-none bg-transparent">
      <HeaderSidebar />
      <SidebarContent className="py-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_ITEMS.map((item) => (
                <SidebarItem key={item.id} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
