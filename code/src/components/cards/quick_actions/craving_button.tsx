import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { tz } from "@date-fns/tz";
import { CravingDialog } from "@/components/cards/quick_actions/craving_dialog";
import React from "react";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { useDailyLog } from "@/lib/hooks/api-hooks/use-daily-log";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { CravingPromptValues } from "@/lib/zod_schemas/health_schema";
import { ClientRecipes } from "@/lib/types/mongo_recipe_types";

export default function CravingButton({ date }: { date: Date }) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "America/New_York";

    const [dateInitialized, setDateInitialized] = React.useState(new Date());
    const [cravingOpen, setCravingOpen] = React.useState(false);

    const { data: daily_log, isLoading: loading_daily_log } = useDailyLog(date);

    const submitCraving = async (recipe: ClientRecipes, form: CravingPromptValues) => {
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
        >
            <Sparkles />
            I'm Craving
        </Button>
        <CravingDialog open={cravingOpen} onOpenChange={setCravingOpen} onSubmit={submitCraving} />
    </>
}