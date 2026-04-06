"use client";

import * as React from "react";
import { CravingPromptSchema, CravingPromptValues } from "@/lib/zod_schemas/health_schema";
import { useAiCravings } from "@/lib/hooks/api-hooks/use-ai-cravings";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";
import { RecipeDialog } from "@/components/cards/quick_actions/recipe_dialog";

type CravingDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (recipe: ClientRecipes, form: CravingPromptValues) => void;
};

export function CravingDialog({ open, onOpenChange, onSubmit }: CravingDialogProps) {
    const { mutateAsync: aiCravingsMutateAsync, isPending: isLoadingRecipe } = useAiCravings();

    return (
        <RecipeDialog<CravingPromptValues>
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
            title="Log Craving Event"
            description="Describe your craving in as much detail as you'd like."
            submitLabel="Submit Craving"
            promptFields={[
                {
                    name: "craving_prompt",
                    field: (field) => (
                        <field.TextField
                            label="Describe your craving"
                            placeholder="e.g., I really want something sweet and salty..."
                        />
                    ),
                    validators: { onBlur: CravingPromptSchema.shape.craving_prompt },
                },
            ]}
            formDefaultValues={{ craving_prompt: "" }}
            requestRecipe={aiCravingsMutateAsync}
            isLoadingRecipe={isLoadingRecipe}
        />
    );
}
