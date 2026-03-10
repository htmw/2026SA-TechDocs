"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavItem } from "@/components/dashboard/nav_config"

export function NavGroup({
    items,
    ...props
}: {
    items: NavItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const pathname = usePathname();

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={pathname === item.url}>
                                <Link href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}