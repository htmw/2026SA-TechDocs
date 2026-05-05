"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log"
import { format } from "date-fns/format"

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

export function SleepCard() {
    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({
        limit: 7,
        sortDir: "desc",
    });
    
    const data = daily_logs.map(log => ({
        date: format(new Date(log.date), "MM/dd"),
        sleep: log.sleep_hours,
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sleep</CardTitle>
                <CardDescription>
                    Showing sleep trends for the last 7 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading_daily_logs ? (
                    <div className="space-y-4">
                        <Skeleton className="h-56 w-full rounded-xl" />
                        <div className="flex gap-3">
                            <Skeleton className="h-4 w-2/5" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    </div>
                ) : data == null || data.length === 0 ? (
                    <Card className="border border-dashed shadow-none">
                        <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                            <p className="text-sm text-muted-foreground">No sleep data logged</p>
                        </CardContent>
                    </Card>
                ) : (
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={data}
                            margin={{
                                left: 0,
                                right: 20,
                            }}
                        >
                            <YAxis
                                domain={['dataMin - 2', 'dataMax + 2']}
                                tickFormatter={(v) => `${v} hours`}
                                tickMargin={12}
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
