"use client"

import { ApiResponse } from "@/lib/types/shared";

/**
 * A client function used to call API endpoints.
 * @param input the url to call or requestinfo object
 * @param init the request init object, used to specify method, body, etc.
 * @returns the data returned from the API, typed as T
 */
export default async function callApi<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    const body = (await res.json()) as ApiResponse<T>;
    if (!res.ok) {
        throw new Error(body.error?.message ?? "Unknown error");
    }
    
    if (!body.success) {
        const err = new Error(body.error?.message ?? "Unknown error");
        (err as any).code = body.error?.code;
        throw err;
    }

    return body.data as T;
}