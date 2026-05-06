export type CookieOptions = {
    path?: string;
    maxAge?: number;
    expires?: Date;
};

export function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie ? document.cookie.split(";") : [];
    for (const cookie of cookies) {
        const [cookieName, ...rest] = cookie.split("=");
        const key = cookieName.trim();
        if (key === name) {
            return decodeURIComponent(rest.join("=")).trim() || null;
        }
    }
    return null;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === "undefined") return;
    const cookieParts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
    cookieParts.push(`path=${options.path ?? "/"}`);

    if (typeof options.maxAge === "number") {
        cookieParts.push(`max-age=${options.maxAge}`);
    }

    if (options.expires instanceof Date) {
        cookieParts.push(`expires=${options.expires.toUTCString()}`);
    }

    document.cookie = cookieParts.join("; ");
}

export function deleteCookie(name: string, options: CookieOptions = {}): void {
    setCookie(name, "", {
        ...options,
        maxAge: 0,
    });
}
