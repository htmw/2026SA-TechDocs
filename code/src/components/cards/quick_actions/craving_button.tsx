import { Button } from "@/components/ui/button";
import { useCreateCravingEvent } from "@/lib/hooks/api-hooks/use-craving-events";
import { Sparkles } from "lucide-react";
import { format, setDate } from "date-fns";
import { tz } from "@date-fns/tz";
import { CravingDialog, CravingDialogFormValues, RecipeSuggestion } from "@/components/cards/quick_actions/craving_dialog";
import React from "react";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { useDailyLog } from "@/lib/hooks/api-hooks/use-daily-log";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function CravingButton({ date }: { date: Date }) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "America/New_York";
    const createCraving = useCreateCravingEvent();

    const [dateInitialized, setDateInitialized] = React.useState(new Date());
    const [cravingOpen, setCravingOpen] = React.useState(false);

    const { data: daily_log, isLoading: loading_daily_log } = useDailyLog(date);

    const requestRecipe = async (value: CravingDialogFormValues) => {
        console.log(value);
        return {
            title: String(Math.floor(Math.random() * 100)),
            ingredients: ["Cheese", "Bread", "Butter"],
            directions: "1. Butter the bread\n2. Place cheese between slices\n3. Grill until golden brown",
            nutrition: "Calories: 400, Protein: 15g, Fat: 20g, Carbs: 30g"
        }
        // const formatted_date = format(date, "yyyy-MM-dd", { timeZone: tz(timezone) });
        // const formatted_date = format(date, "yyyy-MM-dd", { in: tz(timezone), })

        // const payload = {
        //     date: formatted_date,
        //     event: {
        //         occurred_at: dateInitialized.toISOString(),
        //         craving_type: value.craving_type,
        //         intensity: value.craving_intensity,
        //         trigger: value.craving_trigger,
        //         suggested_actions: [
        //             "Some snack 1",
        //             "Some action 2",
        //             "Some action 3",
        //         ],
        //         reasoning: "Some type of reasoning",
        //     },
        // };
        // await createCraving.mutateAsync(payload);
    }

    const submitCraving = async (recipe: RecipeSuggestion, form: CravingDialogFormValues) => {
        console.log(form);
        // const formatted_date = format(date, "yyyy-MM-dd", { timeZone: tz(timezone) });
        // const formatted_date = format(date, "yyyy-MM-dd", { in: tz(timezone), })

        // const payload = {
        //     date: formatted_date,
        //     event: {
        //         occurred_at: dateInitialized.toISOString(),
        //         craving_type: value.craving_type,
        //         intensity: value.craving_intensity,
        //         trigger: value.craving_trigger,
        //         suggested_actions: [
        //             "Some snack 1",
        //             "Some action 2",
        //             "Some action 3",
        //         ],
        //         reasoning: "Some type of reasoning",
        //     },
        // };
        // await createCraving.mutateAsync(payload);
    }

    return <>
        <Button
            variant="default"
            className="flex items-center gap-2"
            onClick={() => {
                if (daily_log) {
                    setDateInitialized(new Date());
                    setCravingOpen(true)
                }
                else {
                    toast.error("You need to check in before logging cravings!")
                }
            }}
            disabled={loading_daily_log}
        >
            {loading_daily_log ? <Spinner data-icon="inline-start" /> : <Sparkles />}
            I'm Craving
        </Button>
        <CravingDialog open={cravingOpen} onOpenChange={setCravingOpen} onRequestRecipe={requestRecipe} onSubmit={submitCraving} />
    </>
}