"use client"

import { LoginResponseBody } from "@/app/api/auth/login/route"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/hooks/useAuthProvider"
import type { ApiResponse, AuthState } from "@/lib/types/shared"
import { LoginZodSchema } from "@/lib/zod_schemas/login_schema"
import { useForm } from "@tanstack/react-form-nextjs"
import Link from "next/dist/client/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function Login() {
    const { setAuthState } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || "/";

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        validators: {
            onBlur: LoginZodSchema,

            onSubmitAsync: async ({ value }) => {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(value),
                })

                const data = await res.json() as ApiResponse<LoginResponseBody>;

                if (data.success) {
                    router.replace(callbackUrl);
                    router.refresh();
                    setAuthState(data.data as AuthState);
                    return;
                }

                //This should never be called because the form should catch validation errors before this, but just in case
                if (data.error?.code === "VALIDATION_ERROR") {
                    if (data?.error?.fields) {
                        return Object.values(data?.error?.fields).join('\n');
                    }
                }

                return data.error?.message ?? 'Something went wrong';
            },
        },
    })

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
                <CardAction>
                    <Button asChild variant="link">
                        <Link href="/auth/signup">
                            Sign Up
                        </Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                >
                    <form.Subscribe
                        selector={(state) => state.errorMap.onSubmit}
                        children={(submitError) => {
                            console.log(submitError);
                            return submitError ? (
                                <div className="flex flex-col gap-6 text-sm text-red-500">{String(submitError)}</div>
                            ) : null
                        }}
                    />
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <form.Field
                                name="email"
                                children={(field) => {
                                    const showError = !field.state.meta.isValid && field.state.meta.isDirty;

                                    return (
                                        <Field data-invalid={showError}>
                                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                type="email"
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="user@nutriai.com"
                                                aria-invalid={showError}
                                            />
                                            {showError && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <form.Field
                                name="password"
                                children={(field) => {
                                    const showError = !field.state.meta.isValid && field.state.meta.isDirty;

                                    return (
                                        <Field data-invalid={showError}>
                                            <div className="flex items-center">
                                                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                                <a
                                                    href="#"
                                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                                >
                                                    Forgot your password?
                                                </a>
                                            </div>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                type="password"
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder="Enter your password"
                                                aria-invalid={showError}
                                            />
                                            {showError && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button type="submit" className="w-full" disabled={isSubmitting} onClick={() => form.handleSubmit({ submitAction: 'continue' })}>
                            {isSubmitting ? '...' : 'Login'}
                        </Button>
                    )}
                />
            </CardFooter>
        </Card>
    )
}
