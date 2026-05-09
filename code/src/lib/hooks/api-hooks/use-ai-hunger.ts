import { useMutation } from "@tanstack/react-query";
import callApi from "@/lib/api";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";
import { HungerEventValues } from "@/lib/zod_schemas/health_schema";

interface AiHungerResponse {
    recipe: ClientRecipes;
    recipes?: ClientRecipes[];
    message?: string;
}

type AiHungerRequest = Pick<HungerEventValues, "hunger_level">;

export function useAiHunger() {
    return useMutation<ClientRecipes[], Error, AiHungerRequest, unknown>({
        mutationFn: async (payload) => {
            const response = await callApi<AiHungerResponse>(`/api/ai/hunger-event`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            if (!response.recipe || response.recipes?.length === 0) {
                throw new Error(response.message ?? "Sorry, there are no recommendations within your calorie limit.");
            }
            return response.recipes ?? [response.recipe];
        },
    });
}