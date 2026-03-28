import { AppShellContext } from "@/context";
import { useContext } from "react";

export function useAppShell() {
    const context = useContext(AppShellContext);
    if (!context) {
        throw new Error("useAppShell must be used within an AppShell");
    }
    return context;
}
