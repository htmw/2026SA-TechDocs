import { ClipboardList, Calendar, LayoutDashboard, LucideIcon, CircleUser, MessageCircle, Flag, Utensils, Candy, Settings } from "lucide-react";

export type NavItem = { title: string; url: string; icon: LucideIcon };

export const navMainItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Meal Journal",
        url: "/meal-journal",
        icon: ClipboardList,
    },
    {
        title: "Daily Log",
        url: "/daily-log",
        icon: Calendar,
    },
    {
        title: "Hunger Check",
        url: "/hunger-check",
        icon: Utensils,
    },
    {
        title: "Craving Check",
        url: "/craving-check",
        icon: Candy,
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
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
    {
        title: "Profile",
        url: "/profile",
        icon: CircleUser,
    },

];

export const pageTitleMap: Record<string, string> = [...navMainItems, ...navFooterItems].reduce(
    (map, item) => {
        map[item.url] = item.title;
        return map;
    },
    {} as Record<string, string>,
);
