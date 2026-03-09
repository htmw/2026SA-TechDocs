"use client"

import { useFieldContext } from "@/components/form/form"
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function PasswordField({ 
    label, 
    show_forgot, 
    placeholder, 
    required 
}: { 
    label: string, 
    required?: boolean,
    show_forgot?: boolean, 
    placeholder?: string 
}) {
    const field = useFieldContext<string>();
    const showError = !field.state.meta.isValid && field.state.meta.isTouched;

    return (
        <Field data-invalid={showError}>
            <div className="grid gap-2">
                <div className="flex items-center">
                    <FieldLabel htmlFor={field.name}>
                        {label}
                        {required && <span className="text-destructive">*</span>}
                    </FieldLabel>
                    {show_forgot && (
                        <a
                            href="#"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    )}
                </div>
                <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    type="password"
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