"use client"

import { useFieldContext } from "@/components/form/form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";


export function EmailField({ label, placeholder }: { label: string, placeholder?: string }) {
    const field = useFieldContext<string>();
    const showError = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
        <Field data-invalid={showError}>
            <div className="grid gap-2">
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    type="email"
                    onBlur={field.handleBlur}
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