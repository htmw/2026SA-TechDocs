import { ProfileSetupValues } from "@/lib/zod_schemas/profile_setup_schema";
import SetupCard from "@/components/setup/setup_card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { calorie_label_map, energy_label_map, gender_label_map, sleep_label_map } from "@/lib/zod_schemas/profile_setup_schema";
import { Spinner } from "@/components/ui/spinner";

type ReviewStepProps = {
    values: ProfileSetupValues;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
};

function ReviewRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3 gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="font-medium text-right">{value || "—"}</span>
        </div>
    );
}

export default function ReviewStep({
    values,
    onBack,
    onSubmit,
    isSubmitting
}: ReviewStepProps) {
    return (
        <SetupCard
            title="Review Your Setup"
            description="Double-check everything before finishing."
            footer={
                <div className="w-full">
                    <Button type="button" className="w-full"  onClick={onSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Spinner /> : "Finish Setup"}
                    </Button>
                </div>
            }
            backButton={
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            }
        >
            <div className="space-y-4">
                <ReviewRow label="Weight" value={String(values.weight ?? "")} />
                <ReviewRow label="Height" value={String(values.height)} />
                <ReviewRow label="Date of Birth" value={values.dob.toLocaleDateString()} />
                <ReviewRow label="Occupation" value={values.occupation} />
                <ReviewRow
                    label="Gender"
                    value={values.gender ? gender_label_map[values.gender] : ""}
                />
                <ReviewRow label="Fitness Level" value={String(values.fitness_level ?? "")} />
                <ReviewRow
                    label="Calories"
                    value={values.avg_calories ? calorie_label_map[values.avg_calories] : ""}
                />
                <ReviewRow
                    label="Sleep"
                    value={values.avg_sleep ? sleep_label_map[values.avg_sleep] : ""}
                />
                <ReviewRow
                    label="Energy"
                    value={values.current_energy ? energy_label_map[values.current_energy] : ""}
                />
            </div>
        </SetupCard>
    );
}