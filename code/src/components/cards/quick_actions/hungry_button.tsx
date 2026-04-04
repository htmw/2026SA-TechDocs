import { Button } from "@/components/ui/button";
import { Flame, Sparkles } from "lucide-react";
import { format, setDate } from "date-fns";
import { tz } from "@date-fns/tz";
import React from "react";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { HungryDialog, HungryDialogFormValues } from "@/components/cards/quick_actions/hungry_dialog";
import { useCreateHungerEvent } from "@/lib/hooks/api-hooks/use-hunger-events";
import { useDailyLog } from "@/lib/hooks/api-hooks/use-daily-log";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function HungryButton({ date }: { date: Date }) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "America/New_York";
    const createHungerEvent = useCreateHungerEvent();

    const [dateInitialized, setDateInitialized] = React.useState(new Date());
    const [hungryOpen, setHungryOpen] = React.useState(false);

    const { data: daily_log, isLoading: loading_daily_log,  } = useDailyLog(date);

    const submitHungerEvent = async (value: HungryDialogFormValues) => {
        const formatted_date = format(date, "yyyy-MM-dd", { in: tz(timezone), })

        const payload = {
            date: formatted_date,
            event: {
                occurred_at: dateInitialized.toISOString(),
                hunger_level: value.hunger_level,
                suggested_actions: [
                    "Some snack 1",
                    "Some action 2",
                    "Some action 3",
                ],
                reasoning: "Some type of reasoning",
            },
        };
        await createHungerEvent.mutateAsync(payload);
    }

    return <>
        <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => {
                if (daily_log) {
                    setDateInitialized(new Date());
                    setHungryOpen(true)
                }
                else {
                    toast.error("You need to check in before logging hunger!")
                }
            }}
            disabled={loading_daily_log}
        >
            {loading_daily_log ? <Spinner data-icon="inline-start" /> : <Flame />}
            I'm Hungry
        </Button>
        <HungryDialog open={hungryOpen} onOpenChange={setHungryOpen} onSubmit={submitHungerEvent} />
    </>
}