"use client"

import callApi from "@/lib/api";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";
import { useQuery } from "@tanstack/react-query";

interface RecipesResponse {
    recipes: ClientRecipes[];
    pagination: {
        page: number;
        limit: number;
        count: number;
    };
}

interface UseRecipesParams {
    page?: number;
    limit?: number;

    sort?: string;
    sort_field?: string;
    sort_dir?: "asc" | "desc" | "-1";
    sort_direction?: "asc" | "desc" | "-1";

    title_exact?: string;
    title_contains?: string;
    title_startsWith?: string;
    title_endsWith?: string;

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

const buildRecipeUrl = (options: UseRecipesParams) => {
    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        const val = typeof value === "number" ? String(value) : value.toString();
        if (val.trim() === "") return;

        params.set(key, val);
    });

    const queryString = params.toString();
    return `/api/nutrition/recipes${queryString ? `?${queryString}` : ""}`;
};

export function useRecipes(params: UseRecipesParams = {}) {
    const url = buildRecipeUrl(params);
    const cacheKey = ["recipes", JSON.stringify(params)];

    return useQuery<RecipesResponse, Error>({
        queryKey: cacheKey,
        queryFn: async () => {
            const res = await callApi<RecipesResponse>(url);
            return res;
        },
    });
}
