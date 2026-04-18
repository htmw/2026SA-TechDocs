import { Button } from "@/components/ui/button";
import { ClipboardCheck, Sparkles } from "lucide-react";
import React from "react";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { useCreateDailyLog, useDailyLog } from "@/lib/hooks/api-hooks/use-daily-log";
import { CheckInDialog, CheckInDialogFormValues } from "@/components/cards/quick_actions/checkin_dialog";
import { toast } from "sonner";

export default function CheckInButton({ date }: { date: Date }) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "America/New_York";
    const createDailyLog = useCreateDailyLog();
    const { data: daily_log, isLoading: loading_daily_log } = useDailyLog(date);

    const [checkInOpen, setCheckInOpen] = React.useState(false);

    const submitCraving = async (value: CheckInDialogFormValues) => {
        const payload = {
            date: date.toISOString(),
            morning_weight: value.morning_weight,
            energy_rating: value.energy_rating,
            sleep_hours: value.sleep_hours,
            stress_level: value.stress_level,
            timezone: timezone,
        };
        try {
            await createDailyLog.mutateAsync(payload);
            setCheckInOpen(false)
        } catch (err) {
            return err;
        }
    }

    return <>
        <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
                if (!daily_log) {
                    setCheckInOpen(true)
                }
                else {
                    toast.error("You've already checked in for today!")
                }
            }}
        >
            <ClipboardCheck />
            Check In
        </Button>
        <CheckInDialog open={checkInOpen} onOpenChange={setCheckInOpen} onSubmit={submitCraving} />
    </>
}