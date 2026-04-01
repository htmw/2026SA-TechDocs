"use client";

import { Card, CardContent } from "@/components/ui/card";

export function TrendNotificationCard({
    trend_text,
    label,
}: {
    trend_text: string;
    label?: string;
}) {
    if (!trend_text) return null;
    const isWarning = label === "warning";
    return (
        <Card className={`w-full ${isWarning ? "bg-orange-500 border-orange-500" : "bg-green-500 border-green-500"}`}>
            <CardContent className="flex items-center justify-between">
                <p className='text-sm text-white'>
                    {trend_text}
                </p>
            </CardContent>
        </Card>
    );
}