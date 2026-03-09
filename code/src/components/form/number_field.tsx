"use client"

import { useFieldContext } from "@/components/form/form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function NumberField({ 
    label, 
    required, 
    placeholder 
}: { 
    label: string, 
    required?: boolean, 
    placeholder?: string 
}) {
    const field = useFieldContext<string>();
    const showError = !field.state.meta.isValid && field.state.meta.isTouched;

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
                    type="number"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={placeholder}
                    aria-invalid={showError}
                />
                {showError && (
                    <FieldError errors={field.state.meta.errors} />
                )}
            </div>
        </Field>
    )
}