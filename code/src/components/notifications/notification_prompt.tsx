"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { CheckInDialog, CheckInDialogFormValues } from "@/components/cards/quick_actions/checkin_dialog";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { useCreateDailyLog, useDailyLog, useDailyLogStatus } from "@/lib/hooks/api-hooks/use-daily-log";
import { toast } from "sonner";
import { getCookie, setCookie } from "@/lib/utils/cookie_utils";

const NOTIFICATIONS_DISABLED_COOKIE = "app_notifications_disabled";
const CHECKIN_REMINDER_SKIP_COOKIE = "daily_checkin_reminder_skipped";
const CHECKIN_SKIP_MAX_AGE_SECONDS = 60 * 60 * 24;

const mealWindows = [
    { startHour: 6, endHour: 10, message: "Fill out your lunch log so you can stay on track today." },
    { startHour: 11, endHour: 14, message: "Fill out your lunch log so you can stay on track today." },
    { startHour: 17, endHour: 20, message: "It's dinner time — add a meal to your journal if you haven’t yet." },
];

export default function NotificationPrompt() {
    const today = React.useMemo(() => new Date(), []);
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "America/New_York";
    const { data: dailyLog, isLoading: loadingDailyLog } = useDailyLog(today);
    const { data: mealsStatus, isLoading: loadingMealStatus } = useDailyLogStatus({
        startDate: today,
        status: "meals",
    });
    const createDailyLog = useCreateDailyLog();

    const [notificationsDisabled, setNotificationsDisabled] = React.useState(true);
    const [dailyCheckinSkipped, setDailyCheckinSkipped] = React.useState(false);
    const [promptOpen, setPromptOpen] = React.useState(false);
    const [promptDismissed, setPromptDismissed] = React.useState(false);
    const [checkInDialogOpen, setCheckInDialogOpen] = React.useState(false);

    React.useEffect(() => {
        const disabled = Boolean(getCookie(NOTIFICATIONS_DISABLED_COOKIE));
        const skipped = Boolean(getCookie(CHECKIN_REMINDER_SKIP_COOKIE));
        setNotificationsDisabled(disabled);
        setDailyCheckinSkipped(skipped);
    }, []);

    React.useEffect(() => {
        if (
            !notificationsDisabled &&
            !dailyCheckinSkipped &&
            !promptDismissed &&
            !loadingDailyLog &&
            !dailyLog
        ) {
            setPromptOpen(true);
        }
    }, [notificationsDisabled, dailyCheckinSkipped, promptDismissed, loadingDailyLog, dailyLog]);

    const handleSkipToday = () => {
        setCookie(CHECKIN_REMINDER_SKIP_COOKIE, "1", { maxAge: CHECKIN_SKIP_MAX_AGE_SECONDS });
        setDailyCheckinSkipped(true);
        setPromptOpen(false);
    };

    const handleOpenCheckIn = () => {
        setPromptOpen(false);
        setPromptDismissed(true);
        setCheckInDialogOpen(true);
    };

    const handleClosePrompt = () => {
        setPromptDismissed(true);
        setPromptOpen(false);
    };

    const mealCount = mealsStatus?.[0]?.meals ?? 0;
    const currentHour = new Date().getHours();
    const mealReminder = mealWindows.find(
        (window) => currentHour >= window.startHour && currentHour < window.endHour,
    );
    const showMealReminder =
        !notificationsDisabled &&
        !loadingMealStatus &&
        mealReminder !== undefined &&
        mealCount === 0;

    return (
        <div className="space-y-4">
            {showMealReminder ? (
                <Card className="border-emerald-500 bg-emerald-50 text-emerald-900">
                    <CardHeader>
                        <CardTitle>Meal reminder</CardTitle>
                        <CardDescription>{mealReminder?.message}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p>If you haven't logged a meal yet today, you can add one now to keep your journal complete.</p>
                        <Button asChild>
                            <Link href="/meal-journal">Open Meal Journal</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : null}

            <Dialog open={promptOpen} onOpenChange={(open) => {
                if (!open) {
                    handleClosePrompt();
                }
            }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Daily Check-In Reminder</DialogTitle>
                        <DialogDescription>
                            You can check in for today now. If you'd like to do it later, we won't prompt you again today.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Completing your daily check-in helps you unlock meal logging and gives you a better picture of your day.
                        </p>
                    </div>
                    <DialogFooter>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={handleSkipToday} className="w-full sm:w-auto">
                                Do it later
                            </Button>
                            <Button onClick={handleOpenCheckIn} className="w-full sm:w-auto">
                                Check in now
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CheckInDialog
                open={checkInDialogOpen}
                onOpenChange={setCheckInDialogOpen}
                onSubmit={async (value: CheckInDialogFormValues) => {
                    try {
                        await createDailyLog.mutateAsync({
                            date: today.toISOString(),
                            timezone,
                            morning_weight: value.morning_weight,
                            energy_rating: value.energy_rating,
                            sleep_hours: value.sleep_hours,
                            stress_level: value.stress_level,
                        });
                        setCheckInDialogOpen(false);
                        toast.success("Checked in for today!");
                    } catch (error) {
                        toast.error("Unable to complete check-in. Please try again.");
                        return error;
                    }
                }}
            />
        </div>
    );
}
