"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientRedirectWrapper() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const callbackUrl = encodeURIComponent(pathname || "/");
        router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
    }, [pathname, router]);

    return null; // nothing rendered
}
