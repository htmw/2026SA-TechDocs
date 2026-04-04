"use client";

import * as React from "react";
import { useAppForm } from "@/components/form/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { hunger_level, HungerLevel } from "@/lib/enums";
import { HungerEventZodSchema } from "@/lib/zod_schemas/health_schema";

export type HungryDialogFormValues = {
    hunger_level: HungerLevel;
};

type HungryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (value: HungryDialogFormValues) => void;
};

export function HungryDialog({ open, onOpenChange, onSubmit }: HungryDialogProps) {
    const form = useAppForm({
        defaultValues: {
            hunger_level: hunger_level.values[0],
        },
        validators: {
            onSubmitAsync: async ({ value }) => {
                const payload = value as HungryDialogFormValues;
                onSubmit(payload);
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
                    <DialogTitle>Log Hunger Event</DialogTitle>
                    <DialogDescription>
                        Use the form below to log a hunger event, including the level of hunger.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submitHandler} className="space-y-4">
                    <form.AppForm>
                        <form.AppField
                            name="hunger_level"
                            validators={{
                                onBlur: HungerEventZodSchema.shape.hunger_level
                            }}
                            children={(field) => (
                                <field.SelectField
                                    label="Hunger Level"
                                    options={hunger_level.entries.map(([value, label]) => ({ value, label }))}
                                />
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">
                                Submit Hunger
                            </Button>
                        </DialogFooter>
                    </form.AppForm>
                </form>
            </DialogContent>
        </Dialog>
    );
}