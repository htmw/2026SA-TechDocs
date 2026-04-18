"use client";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import CravingButton from "@/components/cards/quick_actions/craving_button";
import HungryButton from "@/components/cards/quick_actions/hungry_button";
import CheckInButton from "@/components/cards/quick_actions/checkin_button";

type QuickActionsCardProps = {
    date: Date;
};

export function QuickActionsCard({
    date,
}: QuickActionsCardProps) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                    Quickly log hunger signals or complete your daily check-in.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
                    <CravingButton date={date} />
                    <HungryButton date={date} />
                    <CheckInButton date={date} />
                </div>
            </CardContent>
        </Card>
    );
}