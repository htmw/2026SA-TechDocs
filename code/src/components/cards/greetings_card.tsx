"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sunrise, Sun, Moon } from "lucide-react";
import { getDayPeriod } from "@/lib/utils/utils";
import { format } from "date-fns";
import { tz } from "@date-fns/tz";
import { TrendNotificationCard } from "@/components/cards/trend_notification_card";
import { positive } from "zod";

const icons = {
    Morning: Sunrise,
    Afternoon: Sun,
    Evening: Moon,
};

export function GreetingsCard({
    name,
    timezone,
    trends,
}: {
    name: string;
    timezone?: string;
    trends: string[];
}) {
    const todays_date = new Date();
    timezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

    const day_period = getDayPeriod(
        todays_date,
        timezone
    );

    const today = format(todays_date, "EEEE, MMMM dd", { in: tz(timezone) });
    const Icon = icons[day_period];

    // some extra checking to know what trends are good or bad
    let positive_trends = [];
    if (trends.length > 0) {
        positive_trends[0] = trends[0].toLowerCase().includes("down") ? false : true;
        positive_trends[1] = trends[1].toLowerCase().includes("down") ? true : false;
    }
    return (
        <Card className="w-full">
            <CardContent className="flex items-center justify-between py-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold">
                        Good {day_period}, {name}
                    </h1>

                    <p className="text-sm text-muted-foreground">{today}</p>
                </div>

                <Icon className="h-6 w-6 text-muted-foreground" />
            </CardContent>
            <CardContent className="flex flex-col gap-1">
                {trends.map((trend, index) => (
                <TrendNotificationCard key={index} trend_text={trend} label={positive_trends[index] ? "warning" : "info"} />
            ))}
            </CardContent>
        </Card>
    );
}
