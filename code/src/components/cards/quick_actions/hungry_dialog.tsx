"use client";

import * as React from "react";
import { hunger_level, HungerLevel } from "@/lib/enums";
import { HungerEventZodSchema } from "@/lib/zod_schemas/health_schema";
import { useAiHunger } from "@/lib/hooks/api-hooks/use-ai-hunger";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";
import { RecipeDialog } from "@/components/cards/quick_actions/recipe_dialog";

export type HungryDialogFormValues = {
    hunger_level: HungerLevel;
};

type HungryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (recipe: ClientRecipes, value: HungryDialogFormValues) => void;
};

export function HungryDialog({ open, onOpenChange, onSubmit }: HungryDialogProps) {
    const { mutateAsync: aiHungerMutateAsync, isPending: isLoadingRecipe } = useAiHunger();

    return (
        <RecipeDialog<HungryDialogFormValues>
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
            title="Log Hunger Event"
            description="Choose your current hunger level."
            submitLabel="Submit Hunger"
            promptFields={[
                {
                    name: "hunger_level",
                    field: (field) => (
                        <field.SelectField
                            label="Hunger Level"
                            options={hunger_level.entries.map(([value, label]) => ({ value, label }))}
                        />
                    ),
                    validators: { onBlur: HungerEventZodSchema.shape.hunger_level },
                },
            ]}
            formDefaultValues={{ hunger_level: hunger_level.values[0] }}
            requestRecipe={aiHungerMutateAsync}
            isLoadingRecipe={isLoadingRecipe}
        />
    );
}
