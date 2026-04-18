import SetupCard from "@/components/setup/setup_card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type OptionStepProps<T extends string> = {
    title: string;
    description?: string;
    options: [T, string][];
    value?: T;
    onSelect: (value: T) => void;
    onBack: () => void;
};

export default function OptionStep<T extends string>({
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
                {options.map(([key, label]) => (
                    <Button
                        key={String(key)}
                        type="button"
                        variant={value === key ? "default" : "outline"}
                        className="w-full min-h-14 h-auto py-4 text-base"
                        onClick={() => onSelect(key)}
                    >
                        {label}
                    </Button>
                ))}
            </div>
        </SetupCard>
    );
}