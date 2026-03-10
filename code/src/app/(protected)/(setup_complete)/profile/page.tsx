"use client"

import { useState } from "react"

export default function ProfilePage() {
    // profile form state
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        height: "",
        weight: "",
        occupation: "",
        fitnessLevel: "Moderate",
        hobbies: "",
        averageCalories: "",
        currentEnergyLevel: "5",
        gender: "",
        sleepHours: "",
    })

    // calculated output state
    const [bmi, setBmi] = useState("")
    const [energyScore, setEnergyScore] = useState(0)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    // calculate BMI locally when height or weight changes
    function calculateBMI(height: number, weight: number) {
        if (!height || !weight) return ""

        const bmiValue = (weight * 703) / (height * height)

        return bmiValue.toFixed(1)
    }

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

    // call the Next.js API route to calculate BMI and energy score
    async function handleCalculateProfile() {
        try {
            setLoading(true)
            setErrorMessage("")

            const response = await fetch("/api/nutriai/bmi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    height: formData.height,
                    weight: formData.weight,
                    sleepHours: formData.sleepHours,
                    currentEnergyLevel: formData.currentEnergyLevel,
                    fitnessLevel: formData.fitnessLevel,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Calculation failed.")
            }

            // update screen with API results
            setBmi(String(data.bmi))
            setEnergyScore(Number(data.energyScore))
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : "Something went wrong."
            )
        } finally {
            setLoading(false)
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
                                value={formData.weight}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Occupation
                            </label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="occupation"
                                type="text"
                                value={formData.occupation}
                                onChange={handleChange}
                            />
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
                                <option value="Sedentary">Sedentary</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Active">Active</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Hobbies</label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="hobbies"
                                type="text"
                                value={formData.hobbies}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Average Calorie Intake
                            </label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="averageCalories"
                                type="number"
                                value={formData.averageCalories}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Current Energy Level
                            </label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="currentEnergyLevel"
                                type="number"
                                min="1"
                                max="10"
                                value={formData.currentEnergyLevel}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Gender</label>
                            <select
                                className="w-full rounded-lg border p-2"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Average Hours of Sleep
                            </label>
                            <input
                                className="w-full rounded-lg border p-2"
                                name="sleepHours"
                                type="number"
                                value={formData.sleepHours}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            className="rounded-lg border bg-black px-4 py-2 text-white"
                            type="button"
                            onClick={handleCalculateProfile}
                            disabled={loading}
                        >
                            {loading ? "Calculating..." : "Calculate BMI and Energy"}
                        </button>

                        {errorMessage ? (
                            <p className="text-sm text-red-600">{errorMessage}</p>
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