"use client"

import { fitness_level, hobby_options, occupation_options } from "@/lib/enums"
import { useState, useEffect } from "react"

export default function ProfilePage() {
    // profile form state
    type ProfileForm = {
        name: string
        age: string
        height: string
        weight: string
        occupation: string
        fitnessLevel: string
        hobbies: string[]
        averageCalories: string
        currentEnergyLevel: string
        gender: string
        sleepHours: string
    }

    const [formData, setFormData] = useState<ProfileForm>({
        name: "",
        age: "",
        height: "",
        weight: "",
        occupation: "",
        fitnessLevel: "",
        hobbies: [],
        averageCalories: "",
        currentEnergyLevel: "",
        gender: "",
        sleepHours: "",
    })

    // calculated output state
    const [bmi, setBmi] = useState("")
    const [energyScore, setEnergyScore] = useState(0)
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    // --------------------------------------------
    // LOAD SAVED PROFILE WHEN PAGE OPENS
    // --------------------------------------------
    useEffect(() => {

        async function loadProfile() {

            try {

                const response = await fetch("/api/profile")

                const data = await response.json()
                console.log("PROFILE DATA:", data)

                if (response.ok && data.data?.user) {

                    const profile = data.data.user.profile || {};
                    const fitnessRaw = profile.fitness_level ?? ""
                    const finalFitness = fitnessRaw

                    console.log("RAW FITNESS FROM DB:", profile.fitnessLevel, profile.fitness_level)
                    console.log("FINAL FITNESS SET:", finalFitness)
                    console.log("FULL PROFILE OBJECT:", profile)

                    setFormData({
                        name: data.data.user.name ?? "",
                        age: profile.dob ? String(new Date().getFullYear() - new Date(profile.dob).getFullYear()) : "",     // age not stored its calculate from dob
                        height: profile.height ?? "",
                        weight: profile.weight ?? "",
                        occupation: profile.occupation ?? "",
                        fitnessLevel: finalFitness,
                        hobbies: profile.hobbies ?? [],
                        averageCalories: profile.avg_calories ?? "",
                        currentEnergyLevel: profile.current_energy ?? "",
                        gender: profile.gender ?? "",
                        sleepHours: profile.avg_sleep ?? ""
                    })

                    const loadedHeight = Number(profile.height)
                    const loadedWeight = Number(profile.weight)

                    if (loadedHeight && loadedWeight) {
                        const bmiValue = (loadedWeight * 703) / (loadedHeight * loadedHeight)
                        setBmi(bmiValue.toFixed(1))
                    }

                }

            } catch (error) {

                console.error("Failed to load profile:", error)

            }

        }

        loadProfile()

    }, [])
    useEffect(() => {
        const height = Number(formData.height)
        const weight = Number(formData.weight)

        if (!height || !weight) {
            setBmi("")
            return
        }

        const bmiValue = (weight * 703) / (height * height)
        setBmi(bmiValue.toFixed(1))
    }, [formData.height, formData.weight])

    useEffect(() => {
        let score = 0

        if (formData.sleepHours === "7-9") score += 40
        else if (formData.sleepHours === "5-7") score += 25
        else if (formData.sleepHours) score += 10

        if (formData.currentEnergyLevel === "high") score += 40
        else if (formData.currentEnergyLevel === "medium") score += 25
        else if (formData.currentEnergyLevel === "low") score += 10

        if (formData.fitnessLevel === "Active") score += 20
        else if (formData.fitnessLevel === "Moderate") score += 10

        setEnergyScore(score)
    }, [
        formData.sleepHours,
        formData.currentEnergyLevel,
        formData.fitnessLevel
    ])

    // determine BMI category based on standard medical ranges
    function getBMICategory(bmi: number) {
        if (bmi < 18.5) return "Underweight"
        if (bmi < 25) return "Normal Weight"
        if (bmi < 30) return "Overweight"
        return "Obese"
    }
    // update form values when user types
    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = event.target

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }))
    }


    async function handleSaveProfile() {
        if (!formData.fitnessLevel) {
            setErrorMessage("Select fitness level")
            return
        }
        try {
            setErrorMessage("")
            setSuccessMessage("") // clear old success message
            const currentYear = new Date().getFullYear()
            const birthYear = currentYear - Number(formData.age)
            const dob = `${birthYear}-01-01` // simple conversion (no month/day yet)
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    dob: dob,
                    height: formData.height,
                    weight: formData.weight,
                    occupation: formData.occupation,
                    fitness_level: formData.fitnessLevel,
                    hobbies: formData.hobbies,
                    avg_calories: formData.averageCalories,
                    current_energy: formData.currentEnergyLevel,
                    gender: formData.gender,
                    avg_sleep: formData.sleepHours,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }),
            })

            const data = await response.json()

            if (!response.ok) {

                console.log("FULL ERROR RESPONSE:", data)
                throw new Error(JSON.stringify(data) || "Profile save failed.")

            }

            setSuccessMessage("Profile saved successfully.")
            console.log("SAVE SUCCESS:", data)

        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to save profile.")
        }
    }

    return (
        <div className="mx-auto max-w-4xl">
            {/* screen heading */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Build Your Profile</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your basic information to calculate BMI and preview your energy
                    score.
                </p>
            </div>

            {/* two-column layout for demo presentation */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* left card holds profile inputs */}
                <div className="rounded-2xl border p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Profile Information</h2>

                    <div className="grid gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">Name</label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Age</label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="age"
                                type="number"
                                min={1}
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Height (inches)
                            </label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="height"
                                type="number"
                                min={1}
                                value={formData.height}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Weight (lbs)
                            </label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="weight"
                                type="number"
                                min={1}
                                value={formData.weight}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Occupation
                            </label>
                            <select
                                className="w-full rounded-lg border p-2"
                                name="occupation"
                                value={formData.occupation}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select</option>

                                {occupation_options.entries.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Fitness Level
                            </label>
                            <select
                                className="w-full rounded-lg border p-2"
                                name="fitnessLevel"
                                value={formData.fitnessLevel}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                {fitness_level.entries.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Hobbies
                            </label>

                            <div className="relative">
                                <details className="w-full">
                                    <summary className="cursor-pointer rounded-lg border p-2">
                                        {formData.hobbies.length > 0
                                            ? `${formData.hobbies.length} selected`
                                            : "Select hobbies"}
                                    </summary>

                                    <div className="absolute z-10 mt-2 w-full rounded-lg border bg-background text-foreground p-2 shadow">
                                        {hobby_options.entries.map(([value, label]) => {
                                            const isChecked = formData.hobbies.includes(value)

                                            return (
                                                <label key={value} className="flex items-center gap-2 p-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                hobbies: isChecked
                                                                    ? prev.hobbies.filter((h) => h !== value)
                                                                    : [...prev.hobbies, value],
                                                            }))
                                                        }}
                                                    />
                                                    {label}
                                                </label>
                                            )
                                        })}
                                    </div>
                                </details>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Average Calorie Intake
                            </label>
                            <select
                                className="w-full rounded-lg border p-2"
                                name="averageCalories"
                                value={formData.averageCalories}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option value="lt-1000">Less than 1000</option>
                                <option value="1000-1500">1000-1500</option>
                                <option value="1500-2000">1500-2000</option>
                                <option value="2000-2500">2000-2500</option>
                                <option value="gt-2500">More than 2500</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Current Energy Level
                            </label>
                            <select
                                className="w-full rounded-lg border p-2"
                                name="currentEnergyLevel"
                                value={formData.currentEnergyLevel}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Gender</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Average Hours of Sleep
                            </label>
                            <select
                                className="w-full rounded-lg border p-2"
                                name="sleepHours"
                                value={formData.sleepHours}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option value="lt-5">Less than 5</option>
                                <option value="5-7">5-7</option>
                                <option value="7-9">7-9</option>
                                <option value="9-11">9-11</option>
                                <option value="gt-11">More than 11</option>
                            </select>
                        </div>

                        <button
                            className="rounded-lg border bg-green-600 px-4 py-2 text-white"
                            type="button"
                            onClick={handleSaveProfile}
                        >
                            Update Profile
                        </button>

                        {errorMessage ? (
                            <p className="text-sm text-red-600">{errorMessage}</p>
                        ) : null}
                        {successMessage ? (
                            <p className="text-sm text-green-600">{successMessage}</p>
                        ) : null}
                    </div>
                </div>

                {/* right card holds calculated preview values */}
                <div className="rounded-2xl border p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-semibold">Profile Summary</h2>

                    <div className="space-y-6">
                        <div className="rounded-xl border p-4">
                            <p className="text-sm text-gray-600">BMI</p>
                            <p className="text-3xl font-bold">{bmi || "--"}</p>
                            <p className="text-sm text-gray-600">
                                {bmi ? getBMICategory(Number(bmi)) : ""}
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Auto calculated from height and weight.
                            </p>
                        </div>

                        <div className="rounded-xl border p-4">
                            <p className="text-sm text-gray-600">Energy Meter</p>
                            <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full rounded-full bg-green-500 transition-all"
                                    style={{ width: `${energyScore}%` }}
                                />
                            </div>
                            <p className="mt-3 text-2xl font-bold">{energyScore}%</p>
                            <p className="mt-2 text-sm text-gray-500">
                                Basic demo score based on sleep, current energy, and fitness
                                level.
                            </p>
                        </div>

                        <div className="rounded-xl border p-4">
                            <p className="text-sm text-gray-600">Demo Notes</p>
                            <p className="mt-2 text-sm text-gray-700">
                                This is a starter skeleton for the presentation. It shows the
                                profile inputs, calculated BMI, and a simple energy meter that
                                can later be replaced with full AI logic.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}