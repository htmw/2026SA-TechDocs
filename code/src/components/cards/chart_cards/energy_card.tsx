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

export type EnergyData = {
    date: string;
    energy: string;
}

const energy_levels = ["tired", "normal", "energetic"] as const;

const chartConfig = {
    count: {
        label: "Days",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

function toFrequencyData(energy_data: EnergyData[]) {
    const counts: Record<string, number> = {
        tired: 0,
        normal: 0,
        energetic: 0,
    };

    for (const { energy } of energy_data) {
        if (!energy) continue;
        const key = energy.toLowerCase();
        if (key in counts) counts[key]++;
    }

    return energy_levels.map(level => ({ level, count: counts[level] }));
}


export function EnergyCard({
    energy_data
}: {
    energy_data?: EnergyData[];
}) {
    const chartData = toFrequencyData(energy_data ?? []);
    console.log("Energy chart data:", energy_data);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Energy</CardTitle>
                <CardDescription>
                    Showing energy breakdown for the last 7 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {energy_data == null || energy_data.length === 0 ? (
                    <Card className="border border-dashed shadow-none">
                        <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                            <p className="text-sm text-muted-foreground">No energy data logged</p>
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
                                domain={[0, 7]}
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