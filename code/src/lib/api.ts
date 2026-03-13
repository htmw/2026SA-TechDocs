"use client"

import { ApiResponse } from "@/lib/types/shared";

export default async function callApi<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    if (!res.ok) {
        throw new Error(res.statusText);
    }
    const body = (await res.json()) as ApiResponse<T>;
    
    if (!body.success) {
        const err = new Error(body.error?.message ?? "Unknown error");
        (err as any).code = body.error?.code;
        throw err;
    }

    return body.data as T;
}