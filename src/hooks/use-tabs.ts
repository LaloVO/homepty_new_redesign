"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
interface Props {
  defaultValue?: string;
}
export function useTabs({ defaultValue = "todas" } : Props ) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentTab = searchParams.get("tab") || defaultValue;

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams);
    
    if (value && value !== defaultValue) {
      params.set("tab", value);
    } else {
      // Si es el tab por defecto, lo removemos de la URL para mantenerla limpia
      params.delete("tab");
    }
    
    // Usamos replace para no agregar al historial del navegador
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return {
    handleTabChange,
    currentTab,
  };
}
