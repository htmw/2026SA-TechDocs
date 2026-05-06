"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { deleteCookie, getCookie, setCookie } from "@/lib/utils/cookie_utils";

const NOTIFICATIONS_DISABLED_COOKIE = "app_notifications_disabled";
const CHECKIN_REMINDER_SKIP_COOKIE = "daily_checkin_reminder_skipped";
const NOTIFICATIONS_DISABLE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export default function NotificationSettings() {
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

    React.useEffect(() => {
        const disabled = Boolean(getCookie(NOTIFICATIONS_DISABLED_COOKIE));
        setNotificationsEnabled(!disabled);
    }, []);

    const toggleNotifications = () => {
        if (notificationsEnabled) {
            setCookie(NOTIFICATIONS_DISABLED_COOKIE, "1", {
                maxAge: NOTIFICATIONS_DISABLE_MAX_AGE_SECONDS,
            });
            toast.success("Notification reminders disabled.");
        } else {
            deleteCookie(NOTIFICATIONS_DISABLED_COOKIE);
            toast.success("Notification reminders enabled.");
        }
        setNotificationsEnabled((current) => !current);
    };

    const resetTodayReminder = () => {
        deleteCookie(CHECKIN_REMINDER_SKIP_COOKIE);
        toast.success("Today’s check-in reminder was reset.");
    };

    return (
        <Card className="max-w-3xl">
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                    Enable or disable in-app reminder prompts. When notifications are disabled, the daily check-in and meal reminder alerts will be hidden.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-medium">In-app reminders</p>
                        <p className="text-sm text-muted-foreground">
                            Turn this off to stop the daily check-in and meal log reminders.
                        </p>
                    </div>
                    <Button onClick={toggleNotifications} variant={notificationsEnabled ? "destructive" : "default"}>
                        {notificationsEnabled ? "Disable reminders" : "Enable reminders"}
                    </Button>
                </div>
                <div className="rounded-lg border border-border bg-muted p-4">
                    <p className="text-sm">
                        If you selected “Do it later” on the daily check-in reminder, the prompt is suppressed for one day. You may reset that state here.
                    </p>
                    <Button onClick={resetTodayReminder} className="mt-3">
                        Reset today&apos;s reminder
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
