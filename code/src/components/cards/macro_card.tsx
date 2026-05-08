"use client";

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { calculateDietaryGuidelines, NutrientGuidelines } from "@/lib/utils/nutrition_utils";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { useMeals } from "@/lib/hooks/api-hooks/use-meals";
import { NutritionItem } from "@/lib/zod_schemas/nutrition_schema";
import { useEffect, useState } from "react";

type MacroRadialProps = {
    label: string;
    value: number;
    goal: number;
    unit: string;
    chart_config: ChartConfig;
};

const chart_config = {
    calories: {
        label: "Calories",
        color: "var(--chart-1)",
    },
    protein: {
        label: "Protein",
        color: "var(--chart-2)",
    },
    fat: {
        label: "Fat",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig;

function clampPercent(value: number, goal: number) {
    if (goal <= 0) return 0;
    return Math.min((value / goal) * 100, 100);
}

function MacroRadial({
    label,
    value,
    goal,
    unit,
    chart_config,
}: MacroRadialProps) {
    const percent = clampPercent(value, goal);

    const chartData = [
        { value: percent, fill: `var(--color-${label.toLowerCase()})` },
    ]

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle className="text-center">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chart_config}
                    className="mx-auto aspect-square max-h-[150px]"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={90}
                        endAngle={90 + (percent / 100) * 360}
                        innerRadius={50}
                        outerRadius={72}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-muted last:fill-background"
                            polarRadius={[55, 48]}
                        />
                        <RadialBar dataKey="value" background cornerRadius={10} />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-lg font-bold"
                                                >
                                                    {value}/{goal}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    {unit}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export function NutritionSummaryCard({ date }: { date: Date }) {
    const { user } = useAuth();
    const { data: meals = [], isLoading: meals_loading } = useMeals(date);
    const [guidelines, setGuidelines] = useState<NutrientGuidelines | null>(null);
    console.log(user?.profile?.goals)
    useEffect(() => {
        const fetchGuidelines = async () => {
            const result = await calculateDietaryGuidelines(user?.profile, user?.profile?.goals);
            setGuidelines(result);
        };
        if (user?.profile) fetchGuidelines();
    }, [user]);

    const total_calories = meals.reduce((total, meal) => total + meal.calories, 0);
    const total_protein = meals.reduce((total, meal) => total + meal.protein, 0);
    const total_fat = meals.reduce((total, meal) => total + meal.fat, 0);

    if (!guidelines) return null; // or a skeleton/loader

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Total Nutrition</CardTitle>
                <CardDescription>
                    A quick summary of your daily calories and macros.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2 2xl:grid-cols-3">
                    <MacroRadial
                        label="Calories"
                        value={total_calories}
                        goal={guidelines.calories}
                        unit="kcal"
                        chart_config={chart_config}
                    />
                    <MacroRadial
                        label="Protein"
                        value={total_protein}
                        goal={guidelines.protein}
                        unit="g"
                        chart_config={chart_config}
                    />
                    <MacroRadial
                        label="Fat"
                        value={total_fat}
                        goal={guidelines.fat}
                        unit="g"
                        chart_config={chart_config}
                    />
                </div>
            </CardContent>
        </Card>
    );
}