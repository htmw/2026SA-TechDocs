"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppForm } from "@/components/form/form"
import { goal, Goal, goal_focus } from "@/lib/enums"
import { GoalsCard } from "@/components/cards/goals_card"
import { useAuth } from "@/lib/hooks/useAuthProvider"
import { calculateGoals, UserGoals } from "@/services/goal-calculation-service"
import { useRouter } from "next/navigation"
import { calculateBmi } from "@/services/bmi-service"

type Timeline = "slow" | "moderate" | "aggressive"

type GoalsFormValues = {
    goal: Goal | ""
    targetWeight: string
    timeline: Timeline | ""
}

const timelineOptions = [
    { value: "slow", label: "Slow and steady" },
    { value: "moderate", label: "Moderate pace" },
    { value: "aggressive", label: "Aggressive" },
] as const

const GoalSchema = z.object({
    goal: z.union([z.enum(goal.values), z.literal("")]),
    targetWeight: z.string(),
    timeline: z.union([z.enum(timelineOptions.map((option) => option.value) as [Timeline, ...Timeline[]]), z.literal("")]),
})

export default function GoalsPage() {
    const { user } = useAuth();
    const profile = user!.profile;

    const router = useRouter();
    const [saved, setSaved] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [calc, setCalc] = useState<UserGoals | null>(null);

    const form = useAppForm({
        defaultValues: {
            goal: profile.goals?.[0] ?? "",
            targetWeight: profile.goals?.[1] ?? "",
            timeline: profile.goals?.[2] ?? "",
        },
        validators: {
            onBlur: GoalSchema,
            onSubmitAsync: async (props) => {
                const value = props.value as GoalsFormValues

                if (!value.goal) {
                    return "Please choose a goal."
                }
                if (!value.timeline) {
                    return "Please choose a timeline."
                }

                setSaved(false)
                setErrorMessage("")

                const response = await fetch("/api/profile", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        goals: [value.goal, value.targetWeight, value.timeline],
                    }),
                })

                const data = await response.json()

                if (!response.ok) {
                    const message = data?.error?.message || "Failed to save goal."
                    setErrorMessage(message)
                    return message
                }

                const calc = calculateGoals(user?.profile, [value.goal, value.targetWeight, value.timeline])
                setCalc(calc)
                setSaved(true)

                router.refresh();
            },
        },
    })

    useEffect(() => {
        const calc = calculateGoals(user?.profile, user?.profile.goals)
        setCalc(calc)
    }, [])

    // Calculates BMI from profile.
    const calculateBMI = () => {
        if (!profile?.height || !profile?.weight) return null
        return calculateBmi(profile.weight, profile.height);
    }

    const weightDifference = () => {
        if (!form.state.values.targetWeight || !profile?.weight) return null

        const diff = Number(form.state.values.targetWeight) - Number(profile.weight)

        if (diff === 0) return "You are at your target weight"

        return diff > 0
            ? `You need to gain ${diff} lbs`
            : `You need to lose ${Math.abs(diff)} lbs`
    }

    // Saves selected goal to profile.
    const values = form.state.values as GoalsFormValues
    const goalLabel = values.goal ? goal.map[values.goal as Goal] : ""
    const focusLabel = values.goal
        ? goal_focus.map[values.goal as keyof typeof goal_focus.map] ?? "Balanced Intake"
        : undefined

    const bmi = calculateBMI();
    const diff = weightDifference()

    return (
        <div className="mx-auto w-full max-w-4xl">
            <form onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }} className="m-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Set Your Goal</CardTitle>
                        <CardDescription>Your goal guides every recommendation NutriAI makes.</CardDescription>
                    </CardHeader>
                    <form.AppForm>
                        <CardContent>
                            <form.Subscribe
                                selector={(state) => state.errorMap.onSubmit}
                                children={(submitError) => {
                                    return submitError ? (
                                        <div className="text-sm text-red-600">{String(submitError)}</div>
                                    ) : null
                                }}
                            />
                            <div className="space-y-4">
                                <form.AppField
                                    name="goal"
                                    children={(field) => (
                                        <field.SelectField
                                            label="Choose your goal"
                                            placeholder="Select goal"
                                            required
                                            options={goal.entries.map(([value, label]) => ({ value, label }))}
                                        />
                                    )}
                                />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <form.AppField
                                        name="targetWeight"
                                        children={(field) => (
                                            <field.NumberField
                                                label="Target Weight"
                                                placeholder="Enter target weight (lbs)"
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="timeline"
                                        children={(field) => (
                                            <field.SelectField
                                                label="Timeline"
                                                placeholder="Select timeline"
                                                options={timelineOptions.map((option) => ({
                                                    value: option.value,
                                                    label: option.label,
                                                }))}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-lg font-semibold">Your Current Stats</h2>
                                    {profile ? (
                                        <div className="bg-gray-50 p-4 rounded-xl space-y-1 text-sm text-gray-600 text-center">
                                            <p>Weight: {profile.weight} lbs</p>
                                            <p>Height: {profile.height} inches</p>
                                            {bmi && <p>Your BMI: {bmi}</p>}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Loading...</p>
                                    )}
                                </div>
                                {values.goal && (
                                    <div className="space-y-2">
                                        <h2 className="text-lg font-semibold">Your Goal Summary</h2>
                                        <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-center">
                                            <p className="text-sm text-gray-600">Goal: {goalLabel}</p>
                                            <p className="text-sm text-gray-600">Focus: {focusLabel}</p>
                                            {bmi && <p className="text-sm text-gray-600">BMI: {bmi}</p>}
                                            {diff && <p className="text-sm text-gray-600">{diff}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <form.SubmitButton label="Save Goal" />
                            {saved && (
                                <p className="text-sm text-gray-500">Goal saved successfully.</p>
                            )}
                            {errorMessage && (
                                <p className="text-sm text-red-600">{errorMessage}</p>
                            )}
                        </CardFooter>
                    </form.AppForm>
                </Card>
            </form>
            <div className="m-6">
                {calc && values.goal && (
                    <GoalsCard goals={calc!} goal={values.goal} />
                )}
            </div>
        </div>
    )
}