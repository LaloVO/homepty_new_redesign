"use client";

import {
    BellIcon,
    CircleUserIcon,
    CreditCardIcon,
    Plug2,
    UnfoldVerticalIcon,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { ButtonLogout } from "./button-logout";
import { EasyBrokerModal } from "../integrations/easybroker-modal";

interface NavUserClientProps {
    nombre: string;
    email: string;
    initials: string;
}

export function NavUserClient({ nombre, email, initials }: NavUserClientProps) {
    // Estado del modal fuera del árbol del DropdownMenu para evitar hidratación incorrecta
    const [ebModalOpen, setEbModalOpen] = useState(false);

    return (
        <>
            {/* Modal de Integraciones — renderiza fuera del Dropdown */}
            <EasyBrokerModal open={ebModalOpen} onOpenChange={setEbModalOpen} />

            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="w-9 h-9 shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-blue-400 to-purple-400">
                                    <Avatar className="h-full w-full rounded-full border-2 border-white">
                                        <AvatarImage src={""} alt={""} />
                                        <AvatarFallback className="rounded-full text-xs font-bold">{initials}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-slate-700">
                                        {nombre}
                                    </span>
                                    <span className="text-slate-500 truncate text-xs">
                                        {email}
                                    </span>
                                </div>
                                <UnfoldVerticalIcon className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={""} alt={""} />
                                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{nombre}</span>
                                        <span className="text-muted-foreground truncate text-xs">{email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <CircleUserIcon />
                                    Cuenta
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <CreditCardIcon />
                                    Facturación
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <BellIcon />
                                    Notificaciones
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        setEbModalOpen(true);
                                    }}
                                    className="gap-2 text-emerald-700 focus:text-emerald-700 focus:bg-emerald-50"
                                >
                                    <Plug2 className="w-4 h-4" />
                                    Integraciones
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <ButtonLogout />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    );
}
