"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export default function CravingCheckPage() { // shows questions to check for a craving
    const router = useRouter()

    // saved answers from the user
    const [cravingIntensity, setCravingIntensity] = useState(3)
    const [wantSpecificFood, setWantSpecificFood] = useState("")
    const [recentMeal, setRecentMeal] = useState("")
    const [emotionalTrigger, setEmotionalTrigger] = useState("")
    const [isFull, setIsFull] = useState("")
    const [physicalHunger, setPhysicalHunger] = useState("")
    const [hydration, setHydration] = useState("")
    const [sleep, setSleep] = useState("")
    const [stressLevel, setStressLevel] = useState("")

    // checks the answers and decides if this is a craving
    const cravingAnalysis = useMemo(() => {
        let score = 0

        // stronger craving adds more points
        if (cravingIntensity >= 4) score += 3
        else if (cravingIntensity === 3) score += 2
        else score += 1

        // wanting one exact food points to a craving
        if (wantSpecificFood === "yes") score += 2

        // eating recently points to a craving
        if (recentMeal === "yes") score += 2

        // mood or habit can point to a craving
        if (emotionalTrigger === "yes") score += 2

        // feeling full strongly points to a craving
        if (isFull === "yes") score += 3

        // no physical hunger signs points to a craving
        if (physicalHunger === "no") score += 2

        // low hydration can cause false cravings
        if (hydration === "no") score += 1

        // poor sleep can increase cravings
        if (sleep === "poor") score += 1

        // high stress can increase cravings
        if (stressLevel === "high") score += 1

        const isCraving = score >= 6

        const summary = isCraving
            ? "This looks like a craving. We will guide you to a better option."
            : "This may actually be hunger. We will guide you to the hungry flow."

        return { score, isCraving, summary }

    }, [
        cravingIntensity,
        wantSpecificFood,
        recentMeal,
        emotionalTrigger,
        isFull,
        physicalHunger,
        hydration,
        sleep,
        stressLevel
    ])

    const handleContinue = () => {
        // sends user to Daily Log and opens the correct popup based on the result
        const route = cravingAnalysis.isCraving
            ? "/daily-log?action=craving"
            : "/daily-log?action=hunger"

        router.push(route)
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl border p-8 rounded-xl space-y-6">

                <h1 className="text-3xl font-semibold text-center">
                    Craving Check
                </h1>

                {/* craving intensity question */}
                <div className="space-y-2">
                    <label>How strong is your craving?</label>

                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={cravingIntensity}
                        onChange={(e) => setCravingIntensity(Number(e.target.value))}
                        className="w-full"
                    />

                    {/* craving scale */}
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Very weak</span>
                        <span>Very strong</span>
                    </div>

                    {/* selected craving level */}
                    <p className="text-sm text-gray-600 text-center">
                        {
                            cravingIntensity === 1 ? "Very weak craving" :
                                cravingIntensity === 2 ? "Mild craving" :
                                    cravingIntensity === 3 ? "Moderate craving" :
                                        cravingIntensity === 4 ? "Strong craving" :
                                            "Very strong craving"
                        }
                    </p>
                </div>

                {/* specific food question */}
                <div>
                    <label>Are you craving a specific food?</label>
                    <select value={wantSpecificFood} onChange={(e) => setWantSpecificFood(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>

                {/* recent meal question */}
                <div>
                    <label>Did you eat recently?</label>
                    <select value={recentMeal} onChange={(e) => setRecentMeal(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>

                {/* full feeling question */}
                <div>
                    <label>Do you feel full right now?</label>
                    <select value={isFull} onChange={(e) => setIsFull(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>

                {/* physical hunger question */}
                <div>
                    <label>Do you feel real hunger signs like stomach growling or low energy?</label>
                    <select value={physicalHunger} onChange={(e) => setPhysicalHunger(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>

                {/* mood or habit question */}
                <div>
                    <label>Is this triggered by mood, boredom, or habit?</label>
                    <select value={emotionalTrigger} onChange={(e) => setEmotionalTrigger(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>

                {/* hydration question */}
                <div>
                    <label>Have you had enough water today?</label>
                    <select value={hydration} onChange={(e) => setHydration(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>

                {/* sleep question */}
                <div>
                    <label>How was your sleep?</label>
                    <select value={sleep} onChange={(e) => setSleep(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="good">Good</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>

                {/* stress question */}
                <div>
                    <label>What is your stress level right now?</label>
                    <select value={stressLevel} onChange={(e) => setStressLevel(e.target.value)}>
                        <option value="">Select an option</option>
                        <option value="low">Low</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {/* craving result section */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">
                        Your Craving Result
                    </h2>

                    <p className="text-sm text-gray-500">
                        Based on your answers, here is what NutriAI thinks:
                    </p>

                    {/* result box */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                        <p className="text-sm text-gray-600">
                            Score: {cravingAnalysis.score}
                        </p>

                        <p className="text-sm text-gray-600">
                            {cravingAnalysis.summary}
                        </p>
                    </div>
                </div>

                {/* continue button */}
                <button
                    onClick={handleContinue}
                    className="w-full bg-black text-white py-3 rounded-lg"
                >
                    Continue
                </button>

            </div>
        </main>
    )
}