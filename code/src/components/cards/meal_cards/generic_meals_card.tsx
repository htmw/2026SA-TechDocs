"use client";

import { ChevronRight, Plus, Trash } from "lucide-react";

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
import { ClientMealLog } from "@/lib/types/mongo_daily_log_types";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

type MealsCardProps = {
    title: string;
    meals: ClientMealLog[];
    onAddMeal?: () => void;
    onDelete?: (meal: ClientMealLog) => void;
    isDeleting?: boolean;
    className?: string;
    empty_message?: string;
};

export function GenericMealsCard({
    title,
    meals,
    onAddMeal,
    onDelete,
    isDeleting,
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
                                key={meal._id}
                                variant="outline"
                                className="rounded-xl px-4 py-3"
                            >
                                <ItemContent>
                                    <ItemTitle className="truncate">{meal.food_item}</ItemTitle>

                                    <ItemDescription className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="outline">{meal.calories} cal</Badge>
                                        <Badge variant="outline">{meal.protein}g pro</Badge>
                                        {meal.carbohydrates && <Badge variant="outline">{meal.carbohydrates}g carb</Badge>}
                                        <Badge variant="outline">{meal.fat}g fat</Badge>
                                    </ItemDescription>
                                </ItemContent>

                                <ItemActions className="flex items-center">
                                    {meal.logged_at && (
                                        <span className="text-xs text-muted-foreground">
                                            {format(meal.logged_at, "MMM dd, yyyy")}
                                        </span>
                                    )}

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/30 bg-destructive/10"
                                        onClick={() => onDelete?.(meal)}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <Spinner />
                                        ) : (
                                            <Trash />
                                        )}
                                    </Button>

                                </ItemActions>
                            </Item>
                        ))}
                    </ItemGroup>
                )}
            </CardContent>
        </Card >
    );
}