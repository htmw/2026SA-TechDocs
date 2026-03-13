"use client";

import { ChevronRight, Plus } from "lucide-react";

import { cn } from "@/lib/utils/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
} from "@/components/ui/item";

export type MealSummary = {
    id: string;
    name: string;
    calories: number;
    protein: number;
    sodium: number;
    fat: number;
    serving?: string;
    logged_at?: string;
};

type MealsCardProps = {
    title: string;
    meals: MealSummary[];
    onAddMeal?: () => void;
    onMealClick?: (meal: MealSummary) => void;
    className?: string;
    empty_message?: string;
};

export function MealsCard({
    title,
    meals,
    onAddMeal,
    onMealClick,
    className,
    empty_message = "No meals logged yet.",
}: MealsCardProps) {
    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="tracking-tight">
                    {title}
                </CardTitle>

                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    onClick={onAddMeal}
                    aria-label={`Add meal to ${title}`}
                >
                    <Plus />
                </Button>
            </CardHeader>

            <CardContent>
                {meals.length === 0 ? (
                    <div className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">
                        {empty_message}
                    </div>
                ) : (
                    <ItemGroup className="gap-2">
                        {meals.map((meal) => (
                            <Item
                                key={meal.id}
                                variant="outline"
                                asChild
                                className="rounded-xl px-4 py-3"
                            >
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="default"
                                    className="size-full"
                                    onClick={() => onMealClick?.(meal)}
                                >
                                    <ItemContent>
                                        <ItemTitle className="truncate">{meal.name}</ItemTitle>

                                        <ItemDescription className="mt-2 flex flex-wrap gap-2">
                                            <Badge variant="outline">{meal.calories} cal</Badge>
                                            <Badge variant="outline">{meal.protein}g protein</Badge>
                                            <Badge variant="outline">{meal.fat}g fat</Badge>
                                        </ItemDescription>
                                    </ItemContent>

                                    <ItemActions className="flex items-center">
                                        {meal.logged_at && (
                                            <span className="text-xs text-muted-foreground">
                                                {meal.logged_at}
                                            </span>
                                        )}

                                        <ChevronRight className="size-4 text-muted-foreground" />
                                    </ItemActions>
                                </Button>
                            </Item>
                        ))}
                    </ItemGroup>
                )}
            </CardContent>
        </Card>
    );
}