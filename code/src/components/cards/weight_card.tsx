"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

export function WeightCard({
    weight_data
}: {
    weight_data?: WeightData[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weight</CardTitle>
                <CardDescription>
                    Showing weight trends for the last 7 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {weight_data == null || weight_data.length === 0 ? (
                    <Card className="border border-dashed shadow-none">
                        <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                            <p className="text-sm text-muted-foreground">No weight data logged</p>
                        </CardContent>
                    </Card>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <AreaChart
                            accessibilityLayer
                            data={weight_data}
                            margin={{
                                left: 20,
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
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" hideLabel />}
                            />
                            <Area
                                dataKey="weight"
                                type="linear"
                                fill="var(--color-weight)"
                                fillOpacity={0.4}
                                stroke="var(--color-weight)"
                            />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
