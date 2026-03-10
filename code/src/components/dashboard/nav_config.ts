import { Calculator, Calendar, LayoutDashboard, Settings, LucideIcon, CircleUser, MessageCircle, Flag } from "lucide-react";

export type NavItem = { title: string; url: string; icon: LucideIcon };

export const navMainItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Calorie Calculator",
        url: "/calorie-calculator",
        icon: Calculator,
    },
    {
        title: "Daily Log",
        url: "/daily-log",
        icon: Calendar,
    },
    {
        title: "Goals",
        url: "/goals",
        icon: Flag,
    },
    {
        title: "Chat",
        url: "/chat",
        icon: MessageCircle,
    },
];

export const navFooterItems: NavItem[] = [
    {
        title: "Profile",
        url: "/profile",
        icon: CircleUser,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
];

export const pageTitleMap: Record<string, string> = [...navMainItems, ...navFooterItems].reduce(
    (map, item) => {
        map[item.url] = item.title;
        return map;
    },
    {} as Record<string, string>,
);
