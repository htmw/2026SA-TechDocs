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
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";

export default function HungryButton({ date }: { date: Date }) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "America/New_York";
    const createHungerEvent = useCreateHungerEvent();

    const [dateInitialized, setDateInitialized] = React.useState(new Date());
    const [hungryOpen, setHungryOpen] = React.useState(false);

    const { data: daily_log, isLoading: loading_daily_log,  } = useDailyLog(date);

    const submitHunger = async (recipe: ClientRecipes, form: HungryDialogFormValues) => {
        console.log(form);
        const formatted_date = format(date, "yyyy-MM-dd", { in: tz(timezone), })

        const payload = {
            date: formatted_date,
            event: {
                occurred_at: dateInitialized.toISOString(),
                hunger_level: form.hunger_level,
                suggested_actions: [
                    `Make ${recipe.title} with only ${recipe.calories} calories!`,
                ],
                reasoning: "",
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
        >
            <Flame />
            I'm Hungry
        </Button>
        <HungryDialog open={hungryOpen} onOpenChange={setHungryOpen} onSubmit={submitHunger} />
    </>
}