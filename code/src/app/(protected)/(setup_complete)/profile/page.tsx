"use client"

import { fitness_level, hobby_options, occupation_options, diet_restrictions, medical_history_options, gender, current_energy, avg_sleep, avg_calories, goal as goalEnum, goal_focus } from "@/lib/enums"
import Link from "next/link"
import { useEffect, useState } from "react"
import { z } from "zod"
import { useAppForm } from "@/components/form/form"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuthProvider"
import { useRouter } from "next/navigation"

type GoalValue = keyof typeof goalEnum.map | ""

const ProfileFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    dob: z.date("Date of birth is required"),
    height: z.coerce.number<string>().min(1, "Height is required"),
    weight: z.coerce.number<string>().min(1, "Weight is required"),
    occupation: z.string().min(1, "Occupation is required"),
    fitness_level: z.string().min(1, "Fitness level is required"),
    hobbies: z.array(z.string()),
    avg_calories: z.string().min(1, "Average calories is required"),
    current_energy: z.string().min(1, "Current energy level is required"),
    gender: z.string().min(1, "Gender is required"),
    avg_sleep: z.string().min(1, "Sleep hours are required"),
    diet_restrictions: z.array(z.string()),
    medical_history: z.array(z.string()),
})

function GoalSummary({ goal, bmi }: { goal: GoalValue; bmi: string }) {
    const goalLabel = goal ? goalEnum.map[goal] : "--"
    const goalFocus = goal ? goal_focus.map[goal as keyof typeof goal_focus.map] ?? "Balanced Intake" : "No goal set yet"

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Goal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                <p className="text-sm text-gray-600">Goal: {goalLabel}</p>
                <p className="text-sm text-gray-600">Focus: {goalFocus}</p>
                {bmi && <p className="text-sm text-gray-600">BMI: {bmi}</p>}
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/goals">Edit Goal</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function ProfilePage() {
    type ProfileForm = z.input<typeof ProfileFormSchema>

    const { user } = useAuth();
    const profile = user!.profile;

    const router = useRouter();

    const [bmi, setBmi] = useState("")
    const [energyScore, setEnergyScore] = useState(0)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    const form = useAppForm({
        defaultValues: {
            name: user!.name ?? "",
            dob: new Date(profile.dob ?? ""),
            height: String(profile.height),
            weight: String(profile.weight),
            occupation: profile.occupation ?? "",
            fitness_level: profile.fitness_level ?? "",
            hobbies: profile.hobbies ?? [],
            avg_calories: profile.avg_calories ?? "",
            current_energy: profile.current_energy ?? "",
            gender: profile.gender ?? "",
            avg_sleep: profile.avg_sleep ?? "",
            diet_restrictions: profile.diet_restrictions ?? [],
            medical_history: profile.medical_history ?? [],
        } as ProfileForm,
        validators: {
            onSubmitAsync: async ({ value }: { value: ProfileForm }) => {
                setErrorMessage("")
                setSuccessMessage("")

                const response = await fetch("/api/profile", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: value.name,
                        dob: value.dob,
                        height: value.height,
                        weight: value.weight,
                        occupation: value.occupation,
                        fitness_level: value.fitness_level,
                        hobbies: value.hobbies,
                        avg_calories: value.avg_calories,
                        current_energy: value.current_energy,
                        gender: value.gender,
                        avg_sleep: value.avg_sleep,
                        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        diet_restrictions: value.diet_restrictions,
                        medical_history: value.medical_history,
                    }),
                })

                const data = await response.json()

                if (!response.ok) {
                    const message = data?.error?.message || "Failed to save profile."
                    setErrorMessage(message)
                    return message
                }

                setSuccessMessage("Profile saved successfully.")

                router.refresh();
            },
        },
    })

    useEffect(() => {
        const height = Number(profile.height)
        const weight = Number(profile.weight)

        if (!height || !weight) {
            setBmi("")
            return
        }

        const bmiValue = (weight * 703) / (height * height)
        setBmi(bmiValue.toFixed(1))
    }, [profile.height, profile.weight])

    useEffect(() => {
        let score = 0

        if (profile.avg_sleep === "7-9") score += 40
        else if (profile.avg_sleep === "5-7") score += 25
        else if (profile.avg_sleep) score += 10

        if (profile.current_energy === "high") score += 40
        else if (profile.current_energy === "medium") score += 25
        else if (profile.current_energy === "low") score += 10

        if (profile.fitness_level === "active") score += 20
        else if (profile.fitness_level === "moderate") score += 10

        setEnergyScore(score)
    }, [profile.avg_sleep, profile.current_energy, profile.fitness_level])

    function getBMICategory(bmiValue: number) {
        if (bmiValue < 18.5) return "Underweight"
        if (bmiValue < 25) return "Normal Weight"
        if (bmiValue < 30) return "Overweight"
        return "Obese"
    }

    return (
        <div className="mx-auto w-full">
            <div className="grid gap-6 p-6 lg:grid-cols-2">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                        </CardHeader>
                        <form.AppForm>
                            <CardContent>
                                <form.Subscribe
                                    selector={(state) => state.errorMap.onSubmit}
                                    children={(submitError) =>
                                        submitError ? (
                                            <div className="text-sm text-red-600">{String(submitError)}</div>
                                        ) : null
                                    }
                                />
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                    <form.AppField
                                        name="name"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.name
                                        }}
                                        children={(field) => (
                                            <field.TextField label="Name" placeholder="Jane Doe" required />
                                        )}
                                    />
                                    <form.AppField
                                        name="dob"
                                        children={(field) => (
                                            <field.DateField label="Date of Birth" required />
                                        )}
                                    />
                                    <form.AppField
                                        name="height"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.height
                                        }}
                                        children={(field) => (
                                            <field.NumberField label="Height (inches)" placeholder="Enter height" required />
                                        )}
                                    />
                                    <form.AppField
                                        name="weight"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.weight
                                        }}
                                        children={(field) => (
                                            <field.NumberField label="Weight (lbs)" placeholder="Enter weight" required />
                                        )}
                                    />
                                    <form.AppField
                                        name="occupation"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.occupation
                                        }}
                                        children={(field) => (
                                            <field.SelectField
                                                label="Occupation"
                                                placeholder="Select occupation"
                                                required
                                                options={occupation_options.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="fitness_level"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.fitness_level
                                        }}
                                        children={(field) => (
                                            <field.SelectField
                                                label="Fitness Level"
                                                placeholder="Select fitness level"
                                                required
                                                options={fitness_level.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="hobbies"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.hobbies
                                        }}
                                        children={(field) => (
                                            <field.MultiSelectField
                                                label="Hobbies"
                                                placeholder="Select hobbies"
                                                options={hobby_options.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="avg_calories"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.avg_calories
                                        }}
                                        children={(field) => (
                                            <field.SelectField
                                                label="Average Calorie Intake"
                                                placeholder="Select intake"
                                                required
                                                options={avg_calories.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="current_energy"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.current_energy
                                        }}
                                        children={(field) => (
                                            <field.SelectField
                                                label="Current Energy Level"
                                                placeholder="Select energy level"
                                                required
                                                options={current_energy.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="gender"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.gender
                                        }}
                                        children={(field) => (
                                            <field.SelectField
                                                label="Gender"
                                                placeholder="Select gender"
                                                required
                                                options={gender.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="avg_sleep"
                                        validators={{
                                            onBlur: ProfileFormSchema.shape.avg_sleep
                                        }}
                                        children={(field) => (
                                            <field.SelectField
                                                label="Average Hours of Sleep"
                                                placeholder="Select sleep range"
                                                required
                                                options={avg_sleep.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="diet_restrictions"
                                        children={(field) => (
                                            <field.MultiSelectField
                                                label="Diet Restrictions"
                                                placeholder="Select restrictions"
                                                options={diet_restrictions.entries.map(([value, label]) => ({ value, label }))}
                                            />
                                        )}
                                    />
                                    <form.AppField
                                        name="medical_history"
                                        children={(field) => (
                                            <field.MultiSelectField
                                                label="Medical History"
                                                placeholder="Select medical history"
                                                options={medical_history_options.map((item) => ({ value: item, label: item }))}
                                            />
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                <form.SubmitButton label="Update Profile" />
                                {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
                                {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
                            </CardFooter>
                        </form.AppForm>
                    </Card>
                </form>
                <div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>BMI</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="text-3xl font-bold">{bmi || "--"}</p>
                                <p className="text-sm text-gray-600">{bmi ? getBMICategory(Number(bmi)) : ""}</p>
                                <p className="mt-2 text-xs text-gray-500">Auto calculated from height and weight.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Energy Meter</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${energyScore}%` }} />
                                </div>
                                <p className="text-2xl font-bold">{energyScore}%</p>
                                <p className="text-sm text-gray-500">Basic demo score based on sleep, current energy, and fitness level.</p>
                            </CardContent>
                        </Card>

                        <GoalSummary goal={(profile.goals?.[0] ?? "") as GoalValue} bmi={bmi} />
                    </div>
                </div>
            </div>
        </div>
    )
}