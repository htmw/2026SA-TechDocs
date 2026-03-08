"use client"

import { LoginResponseBody } from "@/app/api/auth/login/route"
import { useAppForm } from "@/components/form/form"
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
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/hooks/useAuthProvider"
import type { ApiResponse, AuthState } from "@/lib/types/shared"
import { LoginZodSchema } from "@/lib/zod_schemas/login_schema"
import Link from "next/dist/client/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function Login() {
    const { setAuthState } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || "/";

    const form = useAppForm({
        defaultValues: {
            email: "",
            password: "",
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
                <form>
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
                        <form.AppField
                            name="email"
                            children={(field) =>
                                <field.EmailField label="Email" placeholder="user@nutriai.com" />
                            }
                        />
                        <form.AppField
                            name="password"
                            children={(field) =>
                                <field.PasswordField label="Password" />
                            }
                        />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <form.AppForm>
                    <form.SubmitButton label="Login" submittingLabel={<Spinner />} />
                </form.AppForm>
            </CardFooter>
        </Card>
    )
}
