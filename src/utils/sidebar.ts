import { SidebarItem } from "@/types";

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 1,
    title: "Dashboard",
    url: "/",
    icon: "home",
  },
  {
    id: 2,
    title: "Explorar",
    url: "/explore",
    icon: "explore",
  },
  {
    id: 3,
    title: "Solicitudes",
    url: "/requests",
    icon: "requests",
  },
  {
    id: 4,
    title: "CRM",
    url: "/crm",
    icon: "crm",
  },
  {
    id: 5,
    title: "Perfil",
    url: "/profile",
    icon: "profile",
  },
    {
    id: 6,
    title: "Mi Sitio Web",
    url: "/my-site",
    icon: "globe",
  },
];

export interface AIToolItem {
  id: number;
  title: string;
  url: string;
  icon: string;
}

export const AI_TOOL_ITEMS: AIToolItem[] = [
  {
    id: 101,
    title: "Predictor de Precio",
    url: "#",
    icon: "ai-predictor",
  },
  {
    id: 102,
    title: "Generador Renders",
    url: "#",
    icon: "ai-renders",
  },
];
