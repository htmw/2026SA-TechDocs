"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
import { EnergyData } from "./energy_card"
import { format } from "date-fns"
import { useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log"

export type StressData = {
    date: string;
    stress: string;
}

const stress_levels = ["relaxed", "low", "moderate", "high"] as const;

const chartConfig = {
    count: {
        label: "Days",
        color: "#2dd4bf",
    },
} satisfies ChartConfig

function toFrequencyData(stress_data: StressData[]) {
    const counts: Record<string, number> = {
        relaxed: 0,
        low: 0,
        moderate: 0,
        high: 0,
    };

    for (const { stress } of stress_data) {
        if (!stress) continue;
        const key = stress.toLowerCase();
        if (key in counts) counts[key]++;
    }

    return stress_levels.map(level => ({ level, count: counts[level] }));
}


export function StressCard({ time }: { time: string }) {
    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({
        limit: time == 'all' ? undefined : 7,
        sortDir: "desc",
    });

    const data = daily_logs.map(log => ({
        date: format(new Date(log.date), "MM/dd"),
        stress: log.stress_level,
    }))
    
    const chartData = toFrequencyData(data ?? []);
    console.log("Stress chart data:", data);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Stress</CardTitle>
                <CardDescription>
                    Showing stress breakdown {time == 'all' ? ' over NutriAI journey' : ' for the last 7 days'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data == null || data.length === 0 ? (
                    <Card className="border border-dashed shadow-none">
                        <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                            <p className="text-sm text-muted-foreground">No stress data logged</p>
                        </CardContent>
                    </Card>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            margin={{ left: 0, right: 20 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="level"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                domain={[0, time == 'all' ?  data.length : 7]}
                                tickFormatter={(v) => `${v} days`}
                                tickMargin={12}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar
                                dataKey="count"
                                fill="var(--color-count)"
                                radius={8}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}