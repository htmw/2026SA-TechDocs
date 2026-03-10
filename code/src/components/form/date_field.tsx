"use client"

import { useFieldContext, useFormContext } from "@/components/form/form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import React from "react";
import { DayPickerProps } from "react-day-picker";


export function DateField({ 
    label, 
    required, 
    calendarProps 
}: {
    label: string, 
    required?: boolean, 
    calendarProps?: DayPickerProps 
}) {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)

    const field = useFieldContext<string>();
    const form = useFormContext();
    const [isFocused, setIsFocused] = React.useState(false);
    const showError =
        !field.state.meta.isValid &&
        (field.state.meta.isTouched || form.state.isSubmitting) &&
        !isFocused;

    return (
        <Field data-invalid={showError}>
            <div className="grid gap-2">
                <FieldLabel htmlFor={field.name}>
                    {label}
                    {required && <span className="text-destructive">*</span>}
                </FieldLabel>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date"
                            className="justify-start font-normal"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    field.handleBlur();
                                }
                            }}
                        >
                            {date ? date.toLocaleDateString() : "Select date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="center">
                        <Calendar
                            {...calendarProps}
                            mode="single"
                            selected={date}
                            defaultMonth={date}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                                setDate(date)
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </Field>
    )
}
