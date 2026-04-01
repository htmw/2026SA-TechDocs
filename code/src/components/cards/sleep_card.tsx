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

export type SleepData = {
    date: string;
    sleep: number;
}

const chartConfig = {
    sleep: {
        label: "Sleep Hours",
        color: "#7c3aed",
    },
} satisfies ChartConfig

export function SleepCard({
    sleep_data
}: {
    sleep_data?: SleepData[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sleep</CardTitle>
                <CardDescription>
                    Showing sleep trends for the last 7 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {sleep_data == null || sleep_data.length === 0 ? (
                    <Card className="border border-dashed shadow-none">
                        <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                            <p className="text-sm text-muted-foreground">No sleep data logged</p>
                        </CardContent>
                    </Card>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={sleep_data}
                            margin={{
                                left: 20,
                                right: 20,
                            }}
                        >
                            <YAxis
                                hide={true}
                                domain={['dataMin - 2', 'dataMax + 2']}
                            />
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
                            <Line
                                dataKey="sleep"
                                type="linear"
                                stroke="var(--color-sleep)"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
