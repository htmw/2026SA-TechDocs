"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { format } from "date-fns"
import { useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log"
import { useAuth } from "@/lib/hooks/useAuthProvider"
import { calculateGoals } from "@/services/goal-calculation-service"
import { IDailyLog } from "@/lib/types/mongo_daily_log_types"
import { IUserProfile } from "@/lib/types/mongo_user_types"

interface DailyGoalResult {
    date: Date;
    hitCalorieTarget: boolean;
    hitProteinTarget: boolean;
    hitCarbTarget: boolean;
    hitFatTarget: boolean;
}

    function evaluateDailyLogs(dailyLogs: IDailyLog[], userProfile: IUserProfile): DailyGoalResult[] {
    const goal = userProfile.goals?.[0];
    return dailyLogs.map((log) => {
        const profileWithLogWeight = { ...userProfile, weight: log.morning_weight };
        const targets = calculateGoals(profileWithLogWeight, userProfile.goals);

        const actualCalories = log.meals.reduce((sum, meal) => sum + meal.calories      * (meal.servings ?? 1), 0);
        const actualProtein  = log.meals.reduce((sum, meal) => sum + meal.protein       * (meal.servings ?? 1), 0);
        const actualCarbs    = log.meals.reduce((sum, meal) => sum + meal.carbohydrates * (meal.servings ?? 1), 0);
        const actualFat      = log.meals.reduce((sum, meal) => sum + meal.fat           * (meal.servings ?? 1), 0);

        const hitCalorieTarget =
            goal === 'lose' ? actualCalories <= targets.calorieIntake :
            goal === 'gain' ? actualCalories >= targets.calorieIntake :
            Math.abs(actualCalories - targets.calorieIntake) / targets.calorieIntake <= 0.10;

        const within10 = (actual: number, target: number) =>
            Math.abs(actual - target) / target <= 0.10;

        return {
            date: log.date,
            hitCalorieTarget,
            hitProteinTarget: within10(actualProtein, targets.proteinIntake),
            hitCarbTarget:    within10(actualCarbs,   targets.carbohydrateIntake),
            hitFatTarget:     within10(actualFat,     targets.fatIntake),
        };
    });
}

function GoalSummaryCards({ results }: { results: DailyGoalResult[] }) {
    const total = results.length;
    const cards = [
        { label: "Calories", count: results.filter(r => r.hitCalorieTarget).length },
        { label: "Protein",  count: results.filter(r => r.hitProteinTarget).length },
        { label: "Carbs",    count: results.filter(r => r.hitCarbTarget).length    },
        { label: "Fat",      count: results.filter(r => r.hitFatTarget).length     },
    ];
    return (
        <div className="grid grid-cols-4 gap-3 px-5 mt-1">
            {cards.map(({ label, count }) => (
                <Card key={label}>
                    <CardContent className="pt-1">
                        <p className="text-sm text-muted-foreground mb-1">{label}</p>
                        <p className="text-3xl font-medium">{count}<span className="text-sm text-muted-foreground">/{total}</span></p>
                        <p className="text-xs text-muted-foreground mt-1">days hit</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

const chartConfig = {
    weight: { label: "Weight", color: "var(--chart-2)" },
} satisfies ChartConfig

export default function GoalTrackingPage() {
    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({ sortDir: "desc" });
    const { user } = useAuth();
    const [goalResults, setGoalResults] = useState<DailyGoalResult[]>([]);

    useEffect(() => {
    if (!user?.profile || daily_logs.length === 0) return;
    setGoalResults(evaluateDailyLogs(daily_logs as unknown as IDailyLog[], user.profile));
}, [daily_logs, user?.profile]);

    const data = daily_logs
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(log => ({
            date: format(new Date(log.date), "MM/dd"),
            meals: log.meals,
            weight: log.morning_weight,
            sleep: log.sleep_hours,
            calories:      log.meals.reduce((sum, meal) => sum + meal.calories      * (meal.servings ?? 1), 0),
            protein:       log.meals.reduce((sum, meal) => sum + meal.protein       * (meal.servings ?? 1), 0),
            carbohydrates: log.meals.reduce((sum, meal) => sum + meal.carbohydrates * (meal.servings ?? 1), 0),
            fat:           log.meals.reduce((sum, meal) => sum + meal.fat           * (meal.servings ?? 1), 0),
        }));

    const avgCalories = data.reduce((sum, day) => sum + day.calories, 0) / data.length || 0;
    const avgProtein  = data.reduce((sum, day) => sum + day.protein,  0) / data.length || 0;
    const avgCarbs    = data.reduce((sum, day) => sum + day.carbohydrates, 0) / data.length || 0;
    const avgFat      = data.reduce((sum, day) => sum + day.fat,      0) / data.length || 0;
    const avgSleep    = data.reduce((sum, day) => sum + day.sleep,      0) / data.length || 0
    
    const goodSleepDays = data.filter(log => (log.sleep ?? 0) >= 8).length;

    const todayTarget = calculateGoals(user?.profile, user?.profile.goals).calorieIntake;

    const [targets, setTargets] = useState({ calorieIntake: 0 });
    useEffect(() => {
        if (!user?.profile) return;
        calculateGoals(user.profile, user.profile.goals);
    }, [user?.profile]);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Goal Tracking</h1>

            {/* weight chart */}
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Weight Progress</CardTitle>
                    <CardDescription>Weight Progress Over Your NutriAI Journey</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <Card className="border border-dashed shadow-none">
                            <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                                <p className="text-sm text-muted-foreground">No weight data logged</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-40 w-full">
                            <LineChart accessibilityLayer data={data} margin={{ left: 0, right: 20 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} interval={0} />
                                <YAxis domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(v) => `${v} lbs`} tickMargin={12} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                                <Line dataKey="weight" type="linear" stroke="var(--color-weight)" strokeWidth={3} />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            <Card className="mt-5">
                <CardHeader><CardTitle>Calories</CardTitle></CardHeader>
                <CardContent>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. calories / day</p>
                            <p className="text-3xl font-medium">{Math.round(avgCalories).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">kcal</p>
                        </div>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Current Calorie Target</p>
                            <p className="text-3xl font-medium">{todayTarget.toLocaleString()}</p>
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
                <CardHeader><CardTitle>Macros</CardTitle></CardHeader>
                <CardContent>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. Protein / day</p>
                            <p className="text-3xl font-medium">{Math.round(avgProtein).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">g</p>
                        </div>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. Carbs / day</p>
                            <p className="text-3xl font-medium">{Math.round(avgCarbs).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">g</p>
                        </div>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. Fat / day</p>
                            <p className="text-3xl font-medium">{Math.round(avgFat).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">g</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className='mt-5'>
                <CardHeader><CardTitle>Target Tracking</CardTitle></CardHeader>
                <CardDescription className="px-6">Reaching within 10% of your macro goals counts!</CardDescription>
                <GoalSummaryCards results={goalResults} />
            </Card>


            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Sleep Progress</CardTitle>
                    <CardDescription>Hours of Sleep You've Had on Your NutriAI Journey</CardDescription>
                </CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <Card className="border border-dashed shadow-none">
                            <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                                <p className="text-sm text-muted-foreground">No sleep data logged</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-40 w-full">
                            <LineChart accessibilityLayer data={data} margin={{ left: 0, right: 20 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} interval={0} />
                                <YAxis domain={['dataMin - 3', 'dataMax + 3']} tickFormatter={(v) => `${v} hrs`} tickMargin={12} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                                <Line dataKey="sleep" type="linear" stroke="var(--color-weight)" strokeWidth={3} />
                            </LineChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            <Card className="mt-5">
                <CardHeader><CardTitle>Sleep</CardTitle></CardHeader>
                <CardContent>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Avg. sleep / day</p>
                            <p className="text-3xl font-medium">{Math.round(avgSleep).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">hrs</p>
                        </div>
                        <div className="bg-muted rounded-md p-4">
                            <p className="text-sm text-muted-foreground mb-1">Days Slept 8 or more Hours</p>
                            <p className="text-3xl font-medium">{goodSleepDays.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground mt-1">days</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}