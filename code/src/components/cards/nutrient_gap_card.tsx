"use client";

import { NutrientGap, NutrientGuidelines, analyzeNutrientGaps, calculateDietaryGuidelines, calculateNutritionScore } from "@/lib/utils/nutrition_utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Activity, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Progress } from "@/components/ui/progress";
import { useMeals } from "@/lib/hooks/api-hooks/use-meals";
import { NutritionItem } from "@/lib/zod_schemas/nutrition_schema";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { useEffect, useState } from "react";


export function NutrientGapCard({ date }: { date: Date }) {
    const { user } = useAuth();
    const { data: meals = [], isLoading: meals_loading } = useMeals(date);
    const [guidelines, setGuidelines] = useState<NutrientGuidelines | null>(null);

    useEffect(() => {
        const fetch = async () => {
            const result = await calculateDietaryGuidelines(user?.profile, user?.profile?.goals);
            setGuidelines(result);
        };
        if (user?.profile) fetch();
    }, [user]);

    const combined_meals: NutritionItem[] = meals.map(m => ({
        id: m._id?.toString() || "",
        name: m.food_item,
        calories: m.calories,
        protein: m.protein,
        carbohydrates: m.carbohydrates,
        sodium: m.sodium,
        fat: m.fat,
    }));

    if (!guidelines) return null;

    const gaps: NutrientGap[] = analyzeNutrientGaps(combined_meals, guidelines);
    const score = calculateNutritionScore(gaps);

    const sortedGaps = [...gaps].sort((a, b) => {
        const priority = { deficient: 1, borderline: 2, surplus: 3, optimal: 4 };
        return priority[a.status] - priority[b.status];
    });


    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1 block">
                    <CardTitle>Diet Analysis</CardTitle>
                    <CardDescription>
                        Review your daily intake targets and address deficiencies.
                    </CardDescription>
                </div>
                <div className={cn(
                    "flex flex-col items-center justify-center rounded-full h-16 w-16 border-4 font-bold text-lg",
                    score >= 80 ? "border-green-500 text-green-600" :
                        score >= 50 ? "border-yellow-500 text-yellow-600" :
                            "border-destructive text-destructive"
                )}>
                    {score}
                </div>
            </CardHeader>
            <CardContent className="mt-4">
                <div className="space-y-6">
                    {sortedGaps.map((gap) => {
                        const percentage = gap.target > 0 ? (gap.current / gap.target) * 100 : 100;
                        const clampedPercentage = Math.min(percentage, 100);

                        let statusColor = "text-green-500";
                        let indicatorColor = "bg-green-500";
                        let Icon = CheckCircle;

                        if (gap.status === "deficient") {
                            statusColor = "text-destructive";
                            indicatorColor = "bg-destructive";
                            Icon = AlertTriangle;
                        } else if (gap.status === "borderline") {
                            statusColor = "text-yellow-600";
                            indicatorColor = "bg-yellow-500";
                            Icon = Activity;
                        } else if (gap.status === "surplus") {
                            statusColor = "text-blue-500";
                            indicatorColor = "bg-blue-500";
                            Icon = AlertCircle;
                            if (gap.nutrient === "Calories" || gap.nutrient === "Fat") {
                                statusColor = "text-orange-500";
                                indicatorColor = "bg-orange-500";
                            }
                        }

                        return (
                            <div key={gap.nutrient} className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className={cn("h-4 w-4", statusColor)} />
                                        <span className="font-semibold text-sm capitalize">{gap.nutrient}</span>
                                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800", statusColor)}>
                                            {gap.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground font-medium">
                                        {gap.current}{gap.unit} / {gap.target}{gap.unit}
                                    </div>
                                </div>
                                <Progress value={clampedPercentage} indicatorClassName={indicatorColor} className="h-2" />
                            </div>
                        );
                    })}
                    {sortedGaps.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            No nutrient data available to analyze.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
