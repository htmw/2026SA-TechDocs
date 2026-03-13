"use client"

import * as React from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavGroup } from "@/components/dashboard/nav_group"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLogout } from "@/lib/hooks/useLogout"

import { navMainItems, navFooterItems } from "@/components/dashboard/nav_config"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar({
    ...props
}:
    React.ComponentProps<typeof Sidebar>) {
    const { logout } = useLogout();

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <a href="/">
                                <Avatar size="sm">
                                    <AvatarImage
                                        src="/nutriai_logo.png"
                                        alt="nutriai"
                                        className="grayscale"
                                    />
                                </Avatar>
                                <span className="text-xl font-semibold">NutriAI</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavGroup items={navMainItems} />
                <NavGroup items={navFooterItems} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <Button asChild variant="outline">
                        <Link href="/" onClick={() => logout()}>
                            Logout
                        </Link>
                    </Button>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
