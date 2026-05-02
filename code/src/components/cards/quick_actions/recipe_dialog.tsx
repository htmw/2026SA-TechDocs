"use client";

import * as React from "react";
import { useAppForm } from "@/components/form/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";

export type PromptFieldConfig<TValues extends Record<string, unknown>> = {
    name: keyof TValues & string;
    field: (field: any) => React.ReactNode;
    validators?: any;
};

export type RecipeDialogProps<TValues extends Record<string, unknown>> = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (recipe: ClientRecipes, values: TValues) => void;
    title: string;
    description: string;
    submitLabel: string;
    promptFields: PromptFieldConfig<TValues>[];
    formDefaultValues: TValues;
    //requestRecipe: (values: TValues) => Promise<ClientRecipes>;
    requestRecipe: (values: TValues) => Promise<ClientRecipes | ClientRecipes[]>;
    isLoadingRecipe: boolean;
};

export function RecipeDialog<TValues extends Record<string, unknown>>({
    open,
    onOpenChange,
    onSubmit,
    title,
    description,
    submitLabel,
    promptFields,
    formDefaultValues,
    requestRecipe,
    isLoadingRecipe,
}: RecipeDialogProps<TValues>) {
    const [step, setStep] = React.useState<0 | 1>(0);
    //const [recipe, setRecipe] = React.useState<ClientRecipes | null>(null);
    const [recipes, setRecipes] = React.useState<ClientRecipes[]>([]);
    const [recipeIndex, setRecipeIndex] = React.useState(0);
    const [recipeError, setRecipeError] = React.useState<string | null>(null);
    const recipe = recipes[recipeIndex] ?? null;

    const requestRecipeInternal = async (values: TValues) => {
        setRecipeError(null);
        //setRecipe(null);
        setRecipes([]);
        setRecipeIndex(0);
        setStep(1);

        try {
            //const recipeSuggestion = await requestRecipe(values);
            //setRecipe(recipeSuggestion);
            const recipeSuggestions = await requestRecipe(values);

            //Store multiple
            if (Array.isArray(recipeSuggestions)) {
                setRecipes(recipeSuggestions);
            } else {
            setRecipes([recipeSuggestions]);
            }

setRecipeIndex(0);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const fallback = "Unable to generate recipe. Please try again.";
            setRecipeError(message || fallback);
            setStep(0);
            throw error;
        }
    };

    const form = useAppForm({
        defaultValues: formDefaultValues,
        validators: {
            onSubmitAsync: async ({ value }) => {
                const payload = value as TValues;

                try {
                    await requestRecipeInternal(payload);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    return message || "Unable to generate recipe. Please try again.";
                }
            },
        },
    });

    React.useEffect(() => {
        if (!open) {
            setStep(0);
            //setRecipe(null);
            setRecipes([]);
            setRecipeIndex(0);
            setRecipeError(null);
            form.reset();
        }
    }, [open, form]);

    const submitHandler = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        await form.handleSubmit({ submitAction: "continue" });
    };

    const generateRecipe = async () => {
        const values = form.state.values as TValues;
        try {
            await requestRecipeInternal(values);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const fallback = "Unable to generate a new recipe. Please try again.";
            setRecipeError(message || fallback);
        }
    };

    const handleConfirm = () => {
        if (!recipe) {
            return;
        }

        onSubmit(recipe, form.state.values as TValues);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-[40rem] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{step === 0 ? title : "Suggested Recipe"}</DialogTitle>
                    <DialogDescription>{step === 0 ? description : "Review the recipe suggestion below. Accept it to confirm or request a new recipe."}</DialogDescription>
                </DialogHeader>

                <form.AppForm>
                    <div className="w-full">
                        {step === 0 ? (
                            <div className="px-1">
                                <form onSubmit={submitHandler} className="space-y-4">
                                    {promptFields.map((fieldConfig) => (
                                        <form.AppField
                                            key={fieldConfig.name}
                                            name={fieldConfig.name}
                                            children={fieldConfig.field}
                                            validators={fieldConfig.validators as any}
                                        />
                                    ))}

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
                                            {isLoadingRecipe ? "Generating recipe…" : submitLabel}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </div>
                        ) : (
                            <div className="px-1">
                                <div className="space-y-4">
                                    <Card className="bg-muted">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold">{recipe?.title ?? "Recipe suggestion"}</CardTitle>
                                        </CardHeader>
                                        {recipe ? (
                                            <CardContent className="flex flex-wrap items-center gap-2">
                                                <Badge variant="default">Calories: {recipe.calories}</Badge>
                                                <Badge variant="default">Protein: {recipe.protein}g</Badge>
                                                <Badge variant="default">Fat: {recipe.fat}g</Badge>
                                                <Badge variant="default">Sodium: {recipe.sodium}mg</Badge>
                                            </CardContent>
                                        ) : null}
                                    </Card>

                                    {isLoadingRecipe && !recipe ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-6 w-3/4" />
                                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                                <div className="space-y-3">
                                                    <Skeleton className="h-4 w-2/3" />
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-full" />
                                                </div>
                                                <div className="space-y-3">
                                                    <Skeleton className="h-4 w-2/3" />
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-full" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                            <Card className="max-h-[40vh] overflow-hidden border-border bg-background">
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-semibold">Ingredients</CardTitle>
                                                </CardHeader>
                                                <CardContent className="max-h-[40vh] overflow-y-auto px-4 pb-4 pt-0">
                                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                                                        {recipe?.ingredients?.length ? (
                                                            recipe.ingredients.map((ingredient, index) => (
                                                                <li key={index}>{ingredient}</li>
                                                            ))
                                                        ) : (
                                                            <li>Loading recipe details...</li>
                                                        )}
                                                    </ul>
                                                </CardContent>
                                            </Card>

                                            <Card className="max-h-[40vh] overflow-hidden border-border bg-background">
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-semibold">Directions</CardTitle>
                                                </CardHeader>
                                                <CardContent className="max-h-[40vh] overflow-y-auto px-4 pb-4 pt-0">
                                                    {Array.isArray(recipe?.directions) ? (
                                                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">
                                                            {recipe.directions.map((stepText, index) => (
                                                                <li key={index}>{stepText}</li>
                                                            ))}
                                                        </ol>
                                                    ) : (
                                                        <p className="mt-2 text-sm text-foreground">{recipe?.directions ?? "Loading recipe details..."}</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    <DialogFooter>
                                        {/*<Button variant="outline" disabled={isLoadingRecipe} onClick={generateRecipe}>
                                            {isLoadingRecipe ? "Requesting new recipe…" : "Request new recipe"}
                                        </Button> */}
                                        <Button variant="outline" disabled={isLoadingRecipe} onClick={() => {
                                            if (recipeIndex < recipes.length - 1) {
                                                setRecipeIndex((prev) => prev + 1);
                                            } else {
                                                generateRecipe();
                                            }
                                            }}
                                        >
                                        {isLoadingRecipe ? "Requesting new recipe…" : "Request new recipe"}
                                        </Button>
                                        <Button onClick={handleConfirm} disabled={!recipe || isLoadingRecipe}>
                                            Accept Recipe
                                        </Button>
                                    </DialogFooter>
                                </div>
                            </div>
                        )}
                    </div>
                </form.AppForm>
            </DialogContent>
        </Dialog>
    );
}
