"use client"

import callApi from "@/lib/api";
import { ClientFood } from "@/lib/types/mongo_food_types";
import { useQuery } from "@tanstack/react-query";

interface FoodsResponse {
    foods: ClientFood[];
    pagination: {
        page: number;
        limit: number;
        count: number;
    };
}

interface UseFoodsParams {
    page?: number;
    limit?: number;

    sort?: string;
    sort_field?: string;
    sort_dir?: "asc" | "desc" | "-1";
    sort_direction?: "asc" | "desc" | "-1";

    food_item_exact?: string;
    food_item_contains?: string;
    food_item_startsWith?: string;
    food_item_endsWith?: string;

    calories_eq?: number;
    calories_gt?: number;
    calories_gte?: number;
    calories_lt?: number;
    calories_lte?: number;

    createdAt_on?: string;
    createdAt_before?: string;
    createdAt_after?: string;

    [key: string]: string | number | undefined;
}

const buildFoodUrl = (options: UseFoodsParams) => {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        const val = typeof value === "number" ? String(value) : value.toString();
        if (val.trim() === "") return;

        params.set(key, val);
    });

    const queryString = params.toString();
    return `/api/nutrition/foods${queryString ? `?${queryString}` : ""}`;
};

export function useFoods(params: UseFoodsParams = {}) {
    const url = buildFoodUrl(params);
    const cacheKey = ["foods", JSON.stringify(params)];

    return useQuery<FoodsResponse, Error>({
        queryKey: cacheKey,
        queryFn: async () => {
            const res = await callApi<FoodsResponse>(url);
            return res;
        },
    });
}
