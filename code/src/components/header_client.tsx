"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme_toggle";
import { useLogout } from "@/lib/hooks/useLogout";

type NavLink = {
    href: string;
    label: string;
};

export default function HeaderClient({
    navLinks,
    isLoggedIn,
}: {
    navLinks: NavLink[];
    isLoggedIn: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <div className="gap-2 hidden md:flex">
                <AuthButtons isLoggedIn={isLoggedIn} />
                <ThemeToggle />
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen((prev) => !prev)}
                className="md:hidden"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>

            {isOpen && (
                <div className="absolute left-0 top-16 w-full bg-background border-t border-border md:hidden">
                    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                        <MobileMenu
                            navLinks={navLinks}
                            isLoggedIn={isLoggedIn}
                            onClose={closeMenu}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

function AuthButtons({
    isLoggedIn,
    onClose,
}: {
    isLoggedIn: boolean;
    onClose?: () => void;
}) {
    if (isLoggedIn) {
        const { logout } = useLogout();

        return (
            <>
                <Button asChild variant="ghost" className="flex-1">
                    <Link href="/dashboard" onClick={onClose}>
                        Dashboard
                    </Link>
                </Button>
                <Button asChild variant="ghost" className="flex-1">
                    <Link href="/" onClick={() => logout(onClose)}>
                        Logout
                    </Link>
                </Button>
            </>
        );
    }

    return (
        <>
            <Button asChild className="flex-1">
                <Link href="/auth/login" onClick={onClose}>
                    Login
                </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1">
                <Link href="/auth/signup" onClick={onClose}>
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
    navLinks: NavLink[];
    isLoggedIn: boolean;
    onClose: () => void;
}) {
    return (
        <div className="space-y-4">
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
                <AuthButtons isLoggedIn={isLoggedIn} onClose={onClose} />
                <ThemeToggle />
            </div>
        </div>
    );
}