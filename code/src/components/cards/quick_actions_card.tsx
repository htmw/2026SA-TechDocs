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

    // allows Daily Log to tell Quick Actions which popup should open
    openAction?: string | null;
};

export function QuickActionsCard({
    date,
    openAction,
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
                    <CravingButton
                        date={date}
                        shouldOpen={openAction === "craving"}
                    />

                    <HungryButton
                        date={date}
                        shouldOpen={openAction === "hunger"}
                    />

                    <CheckInButton date={date} />
                </div>
            </CardContent>
        </Card>
    );
}