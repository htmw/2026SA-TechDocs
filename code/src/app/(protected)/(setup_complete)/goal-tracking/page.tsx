"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { format } from "date-fns"
import { useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log"
import { useAuth } from "@/lib/hooks/useAuthProvider"
import { calculateGoals } from "@/services/goal-calculation-service"

export type WeightData = {
    date: string;
    weight: number;
}

const chartConfig = {
    weight: {
        label: "Weight",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export default function GoalTrackingPage() {
    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({
        sortDir: "desc"
    });

    const { user } = useAuth();
    const data = daily_logs
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(log => ({
        date: format(new Date(log.date), "MM/dd"),
        meals: log.meals,
        weight: log.morning_weight,
        calories: log.meals.reduce((sum, meal) => sum + meal.calories * (meal.servings ?? 1), 0),
        protein:  log.meals.reduce((sum, meal) => sum + meal.protein * (meal.servings ?? 1), 0),
        carbohydrates: log.meals.reduce((sum, meal) => sum + meal.carbohydrates * (meal.servings ?? 1), 0),
        fat:  log.meals.reduce((sum, meal) => sum + meal.fat * (meal.servings ?? 1), 0)
    }))
    const avgCalories = data.reduce((sum, day) => sum + day.calories, 0) / data.length || 0;
    const avgProtein = data.reduce((sum, day) => sum + day.protein, 0) / data.length || 0;
    const avgCarbs = data.reduce((sum, day) => sum + day.carbohydrates, 0) / data.length || 0;
    const avgFat = data.reduce((sum, day) => sum + day.fat, 0) / data.length || 0;

    const targets = calculateGoals(user?.profile, user?.profile.goals)
    const targetCalories = targets.calorieIntake;

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Goal Tracking</h1>


            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Weight Progress</CardTitle>
                    <CardDescription>
                        Weight Progress Over Your NutriAI Journey
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data == null || data.length === 0 ? (
                        <Card className="border border-dashed shadow-none">
                            <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                                <p className="text-sm text-muted-foreground">No weight data logged</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <ChartContainer config={chartConfig}  className="h-40 w-full">
                            <LineChart
                                accessibilityLayer
                                data={data}
                                margin={{
                                    left: 0,
                                    right: 20,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
                                />
                                <YAxis
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                    tickFormatter={(v) => `${v} lbs`}
                                    tickMargin={12}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" hideLabel />}
                                />
                                <Line
                                    dataKey="weight"
                                    type="linear"
                                    stroke="var(--color-weight)"
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>


            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Calories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. calories / day</p>
                            <p className="text-3xl font-medium">{avgCalories.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">kcal</p>
                        </div>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Current Calorie Target</p>
                            <p className="text-3xl font-medium">{targetCalories.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">kcal</p>
                        </div>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Days logged</p>
                            <p className="text-3xl font-medium">{daily_logs.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">days</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Macros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. Protein / day</p>
                            <p className="text-3xl font-medium">{avgProtein.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">g</p>
                        </div>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. Carbs / day</p>
                            <p className="text-3xl font-medium">{avgCarbs.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">g</p>
                        </div>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. Fat / day</p>
                            <p className="text-3xl font-medium">{avgFat.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">g</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        
    )
}