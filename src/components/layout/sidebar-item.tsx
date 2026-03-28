"use client";
import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { type SidebarItem } from "@/types";
import { usePathname } from "next/navigation";
import {
  BriefcaseIcon,
  ClipboardListIcon,
  MapPinIcon,
  UserIcon,
  BrainCircuitIcon,
  ImagePlusIcon,
  GlobeIcon,
  LayoutGridIcon,
} from "lucide-react";

interface Props {
  item: SidebarItem;
}

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  home: LayoutGridIcon,
  explore: MapPinIcon,
  requests: ClipboardListIcon,
  crm: BriefcaseIcon,
  globe: GlobeIcon,
  profile: UserIcon,
  "ai-predictor": BrainCircuitIcon,
  "ai-renders": ImagePlusIcon,
};

export function SidebarItem({ item }: Props) {
  const pathname = usePathname();
  const Icon = ICONS[item.icon] || LayoutGridIcon;
  const isActive = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link
          href={item.url}
          title={item.title}
          className={`pip-nav-item ${isActive ? "active" : ""}`}
        >
          <Icon size={20} />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
