"use client";

import * as React from "react";
import { useAppForm } from "@/components/form/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { craving_intensity, craving_triggers, craving_type, CravingIntensity, CravingTrigger, CravingType } from "@/lib/enums";

export type CravingDialogFormValues = {
    craving_type: CravingType;
    craving_intensity: CravingIntensity;
    craving_trigger: CravingTrigger;
};

export type RecipeSuggestion = {
    title: string;
    ingredients: string[];
    directions: string | string[];
    nutrition?: string;
};

type CravingDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRequestRecipe: (value: CravingDialogFormValues) => Promise<RecipeSuggestion>;
    onSubmit: (recipe: RecipeSuggestion, form: CravingDialogFormValues) => void;
};

export function CravingDialog({ open, onOpenChange, onRequestRecipe, onSubmit }: CravingDialogProps) {
    const [step, setStep] = React.useState<0 | 1>(0);
    const [recipe, setRecipe] = React.useState<RecipeSuggestion | null>(null);
    const [isLoadingRecipe, setIsLoadingRecipe] = React.useState(false);
    const [recipeError, setRecipeError] = React.useState<string | null>(null);

    const form = useAppForm({
        defaultValues: {
            craving_type: craving_type.values[0],
            craving_intensity: craving_intensity.values[0],
            craving_trigger: craving_triggers.values[0],
        },
        validators: {
            onSubmitAsync: async ({ value }) => {
                const payload = value as CravingDialogFormValues;
                setRecipeError(null);
                setIsLoadingRecipe(true);

                try {
                    const recipeSuggestion = await onRequestRecipe(payload);
                    setRecipe(recipeSuggestion);
                    setStep(1);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    const fallback = "Unable to generate recipe. Please try again.";
                    setRecipeError(message || fallback);
                    return message || fallback;
                } finally {
                    setIsLoadingRecipe(false);
                }
            },
        },
    });

    React.useEffect(() => {
        if (!open) {
            setStep(0);
            setRecipe(null);
            setRecipeError(null);
            setIsLoadingRecipe(false);
            form.reset();
        }
    }, [open, form]);

    const submitHandler = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        await form.handleSubmit({ submitAction: "continue" });
    };

    const handleRegenerate = async () => {
        const values = form.state.values as CravingDialogFormValues;
        setRecipeError(null);
        setIsLoadingRecipe(true);

        try {
            const recipeSuggestion = await onRequestRecipe(values);
            setRecipe(recipeSuggestion);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const fallback = "Unable to generate a new recipe. Please try again.";
            setRecipeError(message || fallback);
        } finally {
            setIsLoadingRecipe(false);
        }
    };

    const handleConfirm = () => {
        if (!recipe) {
            return;
        }
        onSubmit(recipe, form.state.values as CravingDialogFormValues);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{step === 0 ? "Log Craving Event" : "Suggested Recipe"}</DialogTitle>
                    <DialogDescription>
                        {step === 0 ? (
                            "Use the form below to log a craving event, including the type of craving, its intensity, and any triggers you identified."
                        ) : (
                            "Review the recipe suggestion below. Accept it to confirm or request a new recipe."
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form.AppForm>
                    <div className="w-full overflow-hidden">
                        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${step * 100}%)` }}>
                            <div className="w-full shrink-0 px-1">
                                <form onSubmit={submitHandler} className="space-y-4">
                                    <form.AppField
                                        name="craving_type"
                                        children={(field) => (
                                            <field.SelectField
                                                label="Craving Type"
                                                options={craving_type.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />

                                    <form.AppField
                                        name="craving_intensity"
                                        children={(field) => (
                                            <field.SelectField
                                                label="Craving Intensity"
                                                options={craving_intensity.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />

                                    <form.AppField
                                        name="craving_trigger"
                                        children={(field) => (
                                            <field.SelectField
                                                label="Craving Trigger"
                                                options={craving_triggers.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />

                                    {recipeError ? (
                                        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                            {recipeError}
                                        </div>
                                    ) : null}

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isLoadingRecipe}>
                                            {isLoadingRecipe ? "Generating recipe…" : "Submit Craving"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </div>

                            <div className="w-full shrink-0 px-1">
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-border bg-muted p-4">
                                        <h3 className="text-lg font-semibold">{recipe?.title ?? "Recipe suggestion"}</h3>
                                        {recipe?.nutrition ? (
                                            <p className="mt-2 text-sm text-muted-foreground">{recipe.nutrition}</p>
                                        ) : null}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-semibold">Ingredients</h4>
                                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                                                {recipe?.ingredients?.length ? (
                                                    recipe.ingredients.map((ingredient, index) => (
                                                        <li key={index}>{ingredient}</li>
                                                    ))
                                                ) : (
                                                    <li>Loading recipe details...</li>
                                                )}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold">Directions</h4>
                                            {Array.isArray(recipe?.directions) ? (
                                                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">
                                                    {recipe.directions.map((stepText, index) => (
                                                        <li key={index}>{stepText}</li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                <p className="mt-2 text-sm text-foreground">{recipe?.directions ?? "Loading recipe details..."}</p>
                                            )}
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" disabled={isLoadingRecipe} onClick={handleRegenerate}>
                                            {isLoadingRecipe ? "Requesting new recipe…" : "Request new recipe"}
                                        </Button>
                                        <Button onClick={handleConfirm} disabled={!recipe || isLoadingRecipe}>
                                            Accept Recipe
                                        </Button>
                                    </DialogFooter>
                                </div>
                            </div>
                        </div>
                    </div>
                </form.AppForm>
            </DialogContent>
        </Dialog>
    );
}