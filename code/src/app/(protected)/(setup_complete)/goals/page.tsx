"use client"

import { useEffect, useState } from "react"

export default function GoalsPage() {

    const [goal, setGoal] = useState("")
    const [targetWeight, setTargetWeight] = useState("")
    const [timeline, setTimeline] = useState("")
    const [saved, setSaved] = useState(false)

    // stores height and weight from the saved profile
    type Profile = {height: number, weight: number}
    const [profile, setProfile] = useState<Profile | null>(null)

    // loads saved profile data to show the user's current stats
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile")
                const data = await res.json()

                // gets the saved profile data(object) from the API response
                const profileData = data.data?.user?.profile

                console.log("GOALS PROFILE:", profileData)

                setProfile(profileData)

            } catch (err) {
                console.error("Failed to load profile", err)
            }
        }

        fetchProfile()
    }, [])

    // calculates bmi from saved height and weight
    const calculateBMI = () => {
        if (!profile?.height || !profile?.weight) return null

        const h = Number(profile.height)
        const w = Number(profile.weight)

        return ((w * 703) / (h * h)).toFixed(1)
    }

    // shows how far the target weight is from current weight
    const weightDifference = () => {
        if (!targetWeight || !profile?.weight) return null

        const diff = Number(targetWeight) - Number(profile.weight)

        if (diff === 0) return "You are at your target weight"

        return diff > 0
            ? `You need to gain ${diff} lbs`
            : `You need to lose ${Math.abs(diff)} lbs`
    }

    // saves the selected goal on the page
    const handleSave = () => {
        if (!goal) return
        setSaved(true)
    }

    const bmi = calculateBMI()
    const diff = weightDifference()

    return (
        <main className="min-h-screen flex flex-col items-center px-6 py-12 gap-8">

            <h1 className="text-3xl font-semibold">
                Set Your Goal
            </h1>

            <p className="text-gray-500 text-center max-w-md">
                Your goal guides every recommendation NutriAI makes.
            </p>

            {/* goal options */}
            <div className="w-full max-w-md space-y-3">
                <h2 className="text-lg font-semibold">
                    Choose your goal
                </h2>

                <div className="flex flex-col gap-3">
                    <button onClick={() => setGoal("lose")} className={`border p-3 rounded-lg ${goal === "lose" ? "bg-black text-white" : ""}`}>
                        Lose Weight
                    </button>

                    <button onClick={() => setGoal("maintain")} className={`border p-3 rounded-lg ${goal === "maintain" ? "bg-black text-white" : ""}`}>
                        Maintain Weight
                    </button>

                    <button onClick={() => setGoal("gain")} className={`border p-3 rounded-lg ${goal === "gain" ? "bg-black text-white" : ""}`}>
                        Build Muscle
                    </button>

                    <button onClick={() => setGoal("energy")} className={`border p-3 rounded-lg ${goal === "energy" ? "bg-black text-white" : ""}`}>
                        Improve Energy
                    </button>
                </div>
            </div>

            {/* current stats section */}
            <div className="w-full max-w-md space-y-2">
                <h2 className="text-lg font-semibold">
                    Your Current Stats
                </h2>

                {profile ? (
                    <div className="bg-gray-50 p-4 rounded-xl space-y-1 text-sm text-gray-600 text-center">
                        <p>Weight: {profile.weight} lbs</p>
                        <p>Height: {profile.height} inches</p>

                        {bmi && (
                            <p>Your BMI: {bmi}</p>
                        )}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Loading...</p>
                )}
            </div>

            {/* target weight section */}
            <div className="w-full max-w-md space-y-2">
                <h2 className="text-lg font-semibold">
                    Target Weight
                </h2>

                <input
                    type="number"
                    placeholder="Enter target weight (lbs)"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full border rounded-lg p-3"
                />

                {diff && (
                    <p className="text-sm text-gray-600 text-center">
                        {diff}
                    </p>
                )}
            </div>

            {/* timeline section */}
            <div className="w-full max-w-md space-y-2">
                <h2 className="text-lg font-semibold">
                    Timeline
                </h2>

                <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full border rounded-lg p-3"
                >
                    <option value="">Select timeline</option>
                    <option value="slow">Slow and steady</option>
                    <option value="moderate">Moderate pace</option>
                    <option value="aggressive">Aggressive</option>
                </select>
            </div>

            {/* goal summary section */}
            {goal && (
                <div className="w-full max-w-md space-y-2">

                    <h2 className="text-lg font-semibold">
                        Your Goal Summary
                    </h2>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-center">

                        <p className="text-sm text-gray-600">
                            Goal: {goal === "lose" ? "Lose Weight" :
                                goal === "maintain" ? "Maintain Weight" :
                                    goal === "gain" ? "Build Muscle" :
                                        "Improve Energy"}
                        </p>

                        <p className="text-sm text-gray-600">
                            Focus: {goal === "lose" ? "Calorie deficit" :
                                goal === "gain" ? "Calorie surplus" :
                                    "Balanced intake"}
                        </p>

                        {bmi && (
                            <p className="text-sm text-gray-600">
                                BMI: {bmi}
                            </p>
                        )}

                        {diff && (
                            <p className="text-sm text-gray-600">
                                {diff}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* save button */}
            <button
                onClick={handleSave}
                className="w-full max-w-md bg-black text-white py-3 rounded-lg"
            >
                Save Goal
            </button>

            {saved && (
                <p className="text-sm text-gray-500">
                    Goal saved successfully.
                </p>
            )}

        </main>
    )
}