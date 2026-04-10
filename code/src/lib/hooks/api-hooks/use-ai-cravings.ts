import { useMutation } from "@tanstack/react-query";
import callApi from "@/lib/api";
import { CravingPromptValues } from "@/lib/zod_schemas/health_schema";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";

interface AiCravingResponse {
    recipe: ClientRecipes;
}

export function useAiCravings() {
    return useMutation<ClientRecipes, Error, CravingPromptValues, unknown>({
        mutationFn: async (payload) => {
            const response = await callApi<AiCravingResponse>(`/api/ai/craving-event`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return response.recipe;
        },
    });
}