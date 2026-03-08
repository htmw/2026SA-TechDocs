"use client"

import { EmailField } from "@/components/form/email_field";
import { PasswordField } from "@/components/form/password_field";
import { SubmitButton } from "@/components/form/submit_button";
import { TextField } from "@/components/form/text_field";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

export const { useAppForm } = createFormHook({
    fieldContext,
    formContext,
    fieldComponents: {
        TextField,
        EmailField,
        PasswordField
    },
    formComponents: {
        SubmitButton
    },
})