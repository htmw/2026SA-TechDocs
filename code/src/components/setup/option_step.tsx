import SetupCard from "@/components/setup/setup_card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { OptionList } from "@/lib/utils/options";

type OptionStepProps<T extends string | number> = {
    title: string;
    description?: string;
    options: OptionList<T>;
    value?: T;
    onSelect: (value: T) => void;
    onBack: () => void;
};

export default function OptionStep<T extends string | number>({
    title,
    description,
    options,
    value,
    onSelect,
    onBack,
}: OptionStepProps<T>) {
    return (
        <SetupCard
            title={title}
            description={description}
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
            <div className="space-y-3">
                {options.map((option) => (
                    <Button
                        key={String(option.value)}
                        type="button"
                        variant={value === option.value ? "default" : "outline"}
                        className="w-full min-h-14 h-auto py-4 text-base"
                        onClick={() => onSelect(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
        </SetupCard>
    );
}