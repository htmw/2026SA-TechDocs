import { useMutation } from "@tanstack/react-query";
import callApi from "@/lib/api";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";
import { HungerEventValues } from "@/lib/zod_schemas/health_schema";

interface AiHungerResponse {
    recipe: ClientRecipes;
}

type AiHungerRequest = Pick<HungerEventValues, "hunger_level">;

export function useAiHunger() {
    return useMutation<ClientRecipes, Error, AiHungerRequest, unknown>({
        mutationFn: async (payload) => {
            const response = await callApi<AiHungerResponse>(`/api/ai/hunger-event`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return response.recipe;
        },
    });
}