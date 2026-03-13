import Link from "next/link";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { getCurrentSession } from "@/app/actions";
import HeaderClient from "./header_client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#contact", label: "Contact" },
];

export default async function Header() {
    const { user } = await getCurrentSession();
    const isLoggedIn = !!user;

    return (
        <header className="bg-background border-b border-border">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="flex flex-row items-center gap-1">
                        <Avatar size="sm">
                            <AvatarImage
                                src="/nutriai_logo.png"
                                alt="nutriai"
                            />
                        </Avatar>
                        <span className="text-xl font-semibold">NutriAI</span>
                    </Link>

                    <DesktopNav navLinks={navLinks} />

                    <HeaderClient navLinks={navLinks} isLoggedIn={isLoggedIn} />
                </div>
            </div>
        </header>
    );
}

function DesktopNav({
    navLinks,
}: {
    navLinks: {
        href: string;
        label: string;
    }[];
}) {
    return (
        <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
                {navLinks.map((link) => (
                    <NavigationMenuItem key={link.href}>
                        <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                            <Link href={link.href}>{link.label}</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}