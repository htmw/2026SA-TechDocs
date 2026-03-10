"use client"

import React from "react";
import { useFieldContext, useFormContext } from "@/components/form/form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";


export function EmailField({
    label,
    placeholder,
    required
}: {
    label: string,
    required?: boolean,
    placeholder?: string
}) {
    const field = useFieldContext<string>();
    const form = useFormContext();

    // only show errors after the field has been touched at least once,
    // and hide them while the field is active (focused again). 
    // also display errors when the form is being submitted so that untouched
    // fields reveal validation on button press.
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
                <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    type="email"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        field.handleBlur();
                        setIsFocused(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            field.handleBlur();
                        }
                    }}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={placeholder || ""}
                    aria-invalid={showError}
                />
                {showError && (
                    <FieldError errors={field.state.meta.errors} />
                )}
            </div>
        </Field>
    )
}