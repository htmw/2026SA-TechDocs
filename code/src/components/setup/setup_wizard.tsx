"use client";

import * as React from "react";

import { cn } from "@/lib/utils/utils";
import { AvgCalories, AvgSleep, CurrentEnergy, Gender, ProfileSetupValues } from "@/lib/zod_schemas/profile_setup_schema";
import BasicInfoStep from "@/components/setup/basic_info_step";
import OptionStep from "@/components/setup/option_step";
import { calorie_options, energy_options, fitness_options, gender_options, sleep_options } from "@/lib/zod_schemas/profile_setup_schema";
import ReviewStep from "@/components/setup/review_step";
import { useAppForm } from "@/components/form/form";
import { ApiResponse } from "@/lib/types/shared";
import { useRouter } from "next/navigation";

const TOTAL_STEPS = 7;

export const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export default function ProfileSetupWizard() {
    const [step, setStep] = React.useState(0);
    const router = useRouter();

    const form = useAppForm({
        defaultValues: {
            dob: new Date(),
            weight: "" as unknown as number,
            height: "" as unknown as number,
            occupation: "" as unknown as string,

            fitness_level: "" as unknown as number,

            avg_calories: "" as unknown as AvgCalories,
            current_energy: "" as unknown as CurrentEnergy,
            gender: "" as unknown as Gender,
            avg_sleep: "" as unknown as AvgSleep,
        } as ProfileSetupValues,
        validators: {
            onSubmitAsync: async ({ value }) => {
                const res = await fetch('/api/setup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(value),
                })

                const data = await res.json() as ApiResponse<any>;

                if (data.success) {
                    router.replace("/dashboard");
                    router.refresh();
                    return;
                }

                //This should never be called because the form should catch validation errors before this, but just in case
                if (data.error?.code === "VALIDATION_ERROR") {
                    if (data?.error?.fields) {
                        console.log("validation error");
                        console.log(Object.values(data?.error?.fields).join('\n'));
                        return Object.values(data?.error?.fields).join('\n');
                    }
                }

                return data.error?.message ?? 'Something went wrong';
            },
        }
    });

    const nextStep = () => {
        setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
    };
    const prevStep = () => {
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const selectAndAdvance = <
        K extends keyof Pick<
            ProfileSetupValues,
            "fitness_level" | "avg_calories" | "current_energy" | "gender" | "avg_sleep"
        >
    >(
        field: K,
        value: ProfileSetupValues[K],
    ) => {
        form.setFieldValue(field, value as any);
        nextStep();
    };

    const values = form.state.values;

    return (
        <div className="w-full max-w-xl overflow-hidden">
            <form.Subscribe
                selector={(state) => state.errorMap.onSubmit}
                children={(submitError) => {
                    return submitError ? (
                        <div className="flex flex-col gap-6 text-sm text-red-500 text-center pb-4">{String(submitError)}</div>
                    ) : null
                }}
            />
            <div className="mb-4 flex justify-center gap-2">
                {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "h-2 w-2 rounded-full transition-all",
                            index === step ? "bg-primary w-6" : "bg-muted-foreground/30",
                        )}
                    />
                ))}
            </div>
            <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${step * 100}%)` }}
            >
                <div className="w-full shrink-0 px-1">
                    <BasicInfoStep form={form as any} onNext={nextStep} />
                </div>

                <div className="w-full shrink-0 px-1">
                    <OptionStep
                        title="What is your gender?"
                        description="Choose the option that best describes you."
                        options={gender_options}
                        value={values.gender}
                        onSelect={(value) => selectAndAdvance("gender", value)}
                        onBack={prevStep}
                    />
                </div>

                <div className="w-full shrink-0 px-1">
                    <OptionStep
                        title="What is your fitness level?"
                        description="Pick a number from 0 to 5."
                        options={fitness_options}
                        value={values.fitness_level}
                        onSelect={(value) => selectAndAdvance("fitness_level", value)}
                        onBack={prevStep}
                    />
                </div>

                <div className="w-full shrink-0 px-1">
                    <OptionStep
                        title="What is your average daily calorie intake?"
                        description="Choose the option that best describes you."
                        options={calorie_options}
                        value={values.avg_calories}
                        onSelect={(value) => selectAndAdvance("avg_calories", value)}
                        onBack={prevStep}
                    />
                </div>

                <div className="w-full shrink-0 px-1">
                    <OptionStep
                        title="How much sleep do you get on average?"
                        description="Choose the range closest to your normal routine."
                        options={sleep_options}
                        value={values.avg_sleep}
                        onSelect={(value) => selectAndAdvance("avg_sleep", value)}
                        onBack={prevStep}
                    />
                </div>

                <div className="w-full shrink-0 px-1">
                    <OptionStep
                        title="How are your current energy levels?"
                        description="Pick the option that feels most accurate."
                        options={energy_options}
                        value={values.current_energy}
                        onSelect={(value) => selectAndAdvance("current_energy", value)}
                        onBack={prevStep}
                    />
                </div>

                <div className="w-full shrink-0 px-1">
                    <form.Subscribe
                        selector={(state) => state.isSubmitting}
                        children={(isSubmitting) => (
                            <ReviewStep
                                values={values}
                                onBack={prevStep}
                                onSubmit={() => form.handleSubmit({ submitAction: 'continue' })}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
}