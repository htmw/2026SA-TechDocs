"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { useCreateDailyLog, useDailyLog } from "@/lib/hooks/api-hooks/use-daily-log";
import { CheckInDialog, CheckInDialogFormValues } from "@/components/cards/quick_actions/checkin_dialog";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

export function CheckInCard({ date }: { date: Date }) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "America/New_York";
    const { data: daily_log, isLoading: loadingDailyLog } = useDailyLog(date);
    const createDailyLog = useCreateDailyLog();
    const [checkInOpen, setCheckInOpen] = React.useState(false);

    const handleSubmit = async (value: CheckInDialogFormValues) => {
        const payload = {
            date: date.toISOString(),
            timezone,
            morning_weight: value.morning_weight,
            energy_rating: value.energy_rating,
            sleep_hours: value.sleep_hours,
            stress_level: value.stress_level,
        };

        try {
            await createDailyLog.mutateAsync(payload);
            setCheckInOpen(false);
            toast.success("Checked in for today!");
        } catch (err) {
            toast.error("Unable to complete check-in. Please try again.");
            return err;
        }
    };

    const formattedDate = format(date, "MMMM dd, yyyy");

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Daily Check In</CardTitle>
                <CardDescription>
                    {loadingDailyLog
                        ? `Checking your ${formattedDate} check-in status...`
                        : daily_log
                            ? `You have checked in on ${formattedDate}.`
                            : `You have not checked in on ${formattedDate}.`
                    }
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {!daily_log && (
                    <p className="text-sm text-muted-foreground">
                        In order to enter meals for this day, you need to complete your daily check-in first.
                    </p>
                )}
                <div className="flex flex-row justify-center w-full">
                    {
                        daily_log
                            ?
                            <div className="rounded-xl border border-border bg-muted p-4 w-full">
                                <p className="text-sm font-medium text-foreground">Great job — your check-in is complete for today.</p>
                            </div>
                            :
                            <Button onClick={() => setCheckInOpen(true)} disabled={loadingDailyLog}>
                                {loadingDailyLog ? <><Spinner /><span>Loading</span></> : "Check In"}
                            </Button>
                    }
                </div>
            </CardContent>

            <CheckInDialog open={checkInOpen} onOpenChange={setCheckInOpen} onSubmit={handleSubmit} />
        </Card>
    );
}
