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
        sortDir: "desc",
    });

    const data = daily_logs.map(log => ({
        date: format(new Date(log.date), "MM/dd"),
        weight: log.morning_weight,
    }))
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Goal Tracking</h1>
            <p>Track your progress towards your nutrition goals here.</p>
            <Card>
                        <CardHeader>
                            <CardTitle>Weight Progress</CardTitle>
                            <CardDescription>
                                Weight Progress Over Time
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
        </div>

        
    )
}