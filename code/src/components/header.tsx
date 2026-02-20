"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: replace with real authentication check

    const navLinks = [
        { href: "/#features", label: "Features" },
        { href: "/#how-it-works", label: "How it works" },
        { href: "/#contact", label: "Contact" },
    ];

    return (
        <header className="bg-background border-b border-border">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-2xl font-bold">
                        NutriAI
                    </Link>

                    <DesktopNav navLinks={navLinks} />

                    <div className="gap-2 hidden md:flex">
                        <AuthButtons isLoggedIn={isLoggedIn} onClose={() => setIsOpen(false)} />
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </Button>
                </div>

                {isOpen && (
                    <MobileMenu
                        navLinks={navLinks}
                        isLoggedIn={isLoggedIn}
                        onClose={() => setIsOpen(false)}
                    />

                )}
            </div>
        </header>
    );
}

function DesktopNav({
    navLinks
}: {
    navLinks: {
        href: string;
        label: string
    }[]
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

function AuthButtons({
    isLoggedIn,
    onClose
}: {
    isLoggedIn: boolean;
    onClose?: () => void
}) {
    if (isLoggedIn) {
        return (
            <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
            </Button>
        );
    }

    return (
        <>
            <Button asChild className="flex-1">
                <Link href="/#login" onClick={onClose}>
                    Login
                </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1">
                <Link href="/#signup" onClick={onClose}>
                    Sign Up
                </Link>
            </Button>
        </>
    );
}

function MobileMenu({
    navLinks,
    isLoggedIn,
    onClose,
}: {
    navLinks: { href: string; label: string }[];
    isLoggedIn: boolean;
    onClose: () => void;
}) {
    return (
        <div className="md:hidden border-t py-4 space-y-4">
            <nav className="flex flex-col gap-2 border-border border-b pb-4">
                {navLinks.map((link) => (
                    <Button asChild variant="ghost" key={link.href}>
                        <Link href={link.href} onClick={onClose}>
                            {link.label}
                        </Link>
                    </Button>
                ))}
            </nav>
            <div className="flex gap-2">
                {isLoggedIn ? (
                    <Button asChild variant="ghost" className="flex-1">
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                ) : (
                    <>
                        <Button asChild className="flex-1">
                            <Link href="/#login" onClick={onClose}>
                                Login
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" className="flex-1">
                            <Link href="/#signup" onClick={onClose}>
                                Sign Up
                            </Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
