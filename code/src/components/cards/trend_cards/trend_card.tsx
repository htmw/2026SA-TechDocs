"use client";

import { useDailyLogs } from "@/lib/hooks/api-hooks/use-daily-log";
import { TrendNotificationCard } from "./trend_notification_card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TrendCard() {
    const { data: daily_logs = [], isLoading: loading_daily_logs } = useDailyLogs({
        limit: 7,
        sortDir: "desc"
    });

    if (daily_logs.length < 2) return [];

    const weight_trend_status = daily_logs[0].morning_weight > daily_logs[daily_logs.length - 1].morning_weight;
    const sleep_trend_status = daily_logs[0].sleep_hours > daily_logs[daily_logs.length - 1].sleep_hours;

    const weight_trend_text = weight_trend_status ? "Your weight is trending up this week." : "Your weight is trending down this week.";
    const sleep_trend_text = sleep_trend_status ? "Your sleep hours are trending up this week." : "Your sleep hours are trending down this week.";

    return (
        <>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Trends</CardTitle>
                    <CardDescription>
                        Showing trends for weight and sleep based on the last 7 days
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col">
                    <TrendNotificationCard
                        trend_text={weight_trend_text}
                        label={weight_trend_status ? "warning" : "info"}
                    />
                    <TrendNotificationCard
                        trend_text={sleep_trend_text}
                        label={sleep_trend_status ? "warning" : "info"}
                    />
                </CardContent>
            </Card>
        </>
    );
}