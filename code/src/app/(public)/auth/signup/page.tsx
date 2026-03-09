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
import { ApiResponse, AuthState } from "@/lib/types/shared"
import { SignupZodSchema } from "@/lib/zod_schemas/login_schema"
import Link from "next/dist/client/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function Signup() {
    const { setAuthState } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || "/";

    const form = useAppForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirm_password: "",
        },
        validators: {
            onBlur: SignupZodSchema,

            onSubmitAsync: async ({ value }) => {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(value),
                })

                const data = await res.json() as ApiResponse<LoginResponseBody>;

                if (data.success) {
                    router.replace("/setup");
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
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                    Make an account today to start using NutriAI
                </CardDescription>
                <CardAction>
                    <Button asChild variant="link">
                        <Link href="/auth/login">
                            Login
                        </Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form.AppForm>
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
                            name="name"
                            children={(field) =>
                                <field.TextField label="Name" placeholder="John Doe" />
                            }
                        />
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
                        <form.AppField
                            name="confirm_password"
                            children={(field) =>
                                <field.PasswordField label="Confirm Password" />
                            }
                        />
                    </div>
                </form.AppForm>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <form.AppForm>
                    <form.SubmitButton label="Sign Up" submittingLabel={<Spinner />} />
                </form.AppForm>
            </CardFooter>
        </Card>
    )
}
