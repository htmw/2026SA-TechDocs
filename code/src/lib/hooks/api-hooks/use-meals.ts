"use client"

import callApi from "@/lib/api";
import { ClientMealLog } from "@/lib/types/mongo_daily_log_types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns/format";

interface MealsResponse {
    meals: ClientMealLog[];
}

interface MealResponse {
    meal: ClientMealLog;
}

export function useMeals(formatted_date: string) {
    return useQuery<ClientMealLog[], Error>({
        queryKey: ["meals", formatted_date],
        queryFn: async () => {
            const res = await callApi<MealsResponse>(`/api/health/daily-logs/${formatted_date}/meals`);
            return res.meals;
        }
    });
}

export function useCreateMeal() {
    const qc = useQueryClient();

    return useMutation<MealResponse, Error, { date: string; meal: Omit<ClientMealLog, "_id"> }, unknown>({
        mutationFn: ({ date, meal }) =>
            callApi<MealResponse>(`/api/health/daily-logs/${date}/meals`, {
                method: "POST",
                body: JSON.stringify(meal),
            }),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["meals", variables.date] });
        },
    });
}

export function useUpdateMeal() {
    const qc = useQueryClient();

    return useMutation<MealResponse, Error, { date: string; id: string; meal: Partial<Omit<ClientMealLog, "_id">> }, unknown>({
        mutationFn: ({ date, id, meal }) =>
            callApi<MealResponse>(`/api/health/daily-logs/${date}/meals/${id}`, {
                method: "PATCH",
                body: JSON.stringify(meal),
            }),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["meals", variables.date] });
        },
    });
}

export function useDeleteMeal() {
    const qc = useQueryClient();

    return useMutation<null, Error, { date: string; id: string }, unknown>({
        mutationFn: ({ date, id }) =>
            callApi<null>(`/api/health/daily-logs/${date}/meals/${id}`, { method: "DELETE" }),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ["meals", variables.date] });
        },
        onError: (error: Error) => {
            console.error("Error deleting meal:", error.message);
        },
    });
}