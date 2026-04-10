"use client";

import * as React from "react";
import { useAppForm } from "@/components/form/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { energy_rating, EnergyRating, stress_level, StressLevel } from "@/lib/enums";
import { DailyLogZodSchema } from "@/lib/zod_schemas/health_schema";
import z from "zod";

export type CheckInDialogFormValues = {
    morning_weight: number;
    energy_rating: EnergyRating;
    sleep_hours: number;
    stress_level: StressLevel;
};

type CheckInDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (value: CheckInDialogFormValues) => void;
};

export function CheckInDialog({ open, onOpenChange, onSubmit }: CheckInDialogProps) {

    const form = useAppForm({
        defaultValues: {
            morning_weight: "" as unknown as number,
            energy_rating: energy_rating.values[0],
            sleep_hours: "" as unknown as number,
            stress_level: stress_level.values[0],
        },
        validators: {
            onSubmitAsync: async ({ value }) => {
                const payload = value as CheckInDialogFormValues;
                const result = await onSubmit(payload);
                return result;
            },
        },
    });

    const submitHandler = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        await form.handleSubmit({ submitAction: "continue" });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Daily Check In</DialogTitle>
                    <DialogDescription>
                        Use the form below to log your daily check-in information.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submitHandler} className="space-y-4">
                    <form.AppForm>
                        <form.Subscribe
                            selector={(state) => state.errorMap.onSubmit}
                            children={(submitError) => {
                                return submitError ? (
                                    <div className="flex flex-col gap-6 text-sm text-red-500">{String(submitError)}</div>
                                ) : null
                            }}
                        />
                        <form.AppField
                            name="morning_weight"
                            validators={{
                                onBlur: (props: { value: number }) => {
                                    const result = DailyLogZodSchema.shape.morning_weight.safeParse(props.value);
                                    if (!result.success) {
                                        return { message: z.treeifyError(result.error).errors };
                                    }
                                    return undefined;
                                }
                            }}
                            children={(field) => (
                                <field.NumberField
                                    label="Morning Weight (lbs)"
                                    placeholder="Enter your morning weight"
                                />
                            )}
                        />
                        <form.AppField
                            name="sleep_hours"
                            validators={{
                                onBlur: (props: { value: number }) => {
                                    const result = DailyLogZodSchema.shape.sleep_hours.safeParse(props.value);
                                    if (!result.success) {
                                        return { message: z.treeifyError(result.error).errors };
                                    }
                                    return undefined;
                                }
                            }}
                            children={(field) => (
                                <field.NumberField
                                    label="Sleep Hours"
                                    placeholder="Enter your sleep hours"
                                />
                            )}
                        />
                        <form.AppField
                            name="stress_level"
                            children={(field) => (
                                <field.SelectField
                                    label="Stress Level"
                                    options={stress_level.entries.map(([value, label]) => ({ value, label }))}
                                />
                            )}
                        />
                        <form.AppField
                            name="energy_rating"
                            children={(field) => (
                                <field.SelectField
                                    label="Energy Rating"
                                    options={energy_rating.entries.map(([value, label]) => ({ value, label }))}
                                />
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">
                                Check In
                            </Button>
                        </DialogFooter>
                    </form.AppForm>
                </form>
            </DialogContent>
        </Dialog>
    );
}