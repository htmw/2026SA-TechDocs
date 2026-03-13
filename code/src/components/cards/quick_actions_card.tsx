"use client";

import { Flame, Sparkles, ClipboardCheck } from "lucide-react";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type QuickActionsCardProps = {
    onCraving?: () => void;
    onHungry?: () => void;
    onCheckIn?: () => void;
};

export function QuickActionsCard({
    onCraving,
    onHungry,
    onCheckIn,
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
                    <Button
                        variant="default"
                        className="flex items-center gap-2"
                        onClick={onCraving}
                    >
                        <Sparkles />
                        I'm Craving
                    </Button>

                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={onHungry}
                    >
                        <Flame />
                        I'm Hungry
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={onCheckIn}
                    >
                        <ClipboardCheck />
                        Check In
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}