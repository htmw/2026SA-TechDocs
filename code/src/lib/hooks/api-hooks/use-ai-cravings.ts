import { useMutation } from "@tanstack/react-query";
import callApi from "@/lib/api";
import { CravingPromptValues } from "@/lib/zod_schemas/health_schema";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";

interface AiCravingResponse {
    recipe: ClientRecipes;
    recipes?: ClientRecipes[];
    message?: string;
}

export function useAiCravings() {
    return useMutation<ClientRecipes[], Error, CravingPromptValues, unknown>({
        mutationFn: async (payload) => {
            const response = await callApi<AiCravingResponse>(`/api/ai/craving-event`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            //Return error message if no recipes found within user's calories.
            if (!response.recipe || response.recipes?.length === 0) {
                throw new Error("No recipes within your calories.");
            }
            return response.recipes ?? [response.recipe];
        },
    });
}