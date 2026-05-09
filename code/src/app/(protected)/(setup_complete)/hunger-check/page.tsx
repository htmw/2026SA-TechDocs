"use client"

// hunger check page route: /hunger-check
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export default function HungerCheckPage() { // shows questions to decide hunger or craving
    const router = useRouter()

    // saved answers from the user
    const [hungerLevel, setHungerLevel] = useState(3)
    const [lastMealHours, setLastMealHours] = useState(2)
    const [energyLevel, setEnergyLevel] = useState("medium")
    const [wantSpecificFood, setWantSpecificFood] = useState("no")
    const [stomachFeeling, setStomachFeeling] = useState("no")
    const [resultMessage, setResultMessage] = useState("")

    // checks the answers and decides if this is hunger or a craving
    const hungerAnalysis = useMemo(() => {
        let score = 0

        // higher hunger level adds more hunger points
        if (hungerLevel >= 4) score += 3
        else if (hungerLevel === 3) score += 2
        else if (hungerLevel === 2) score += 1

        // more time since last meal adds more hunger points
        if (lastMealHours >= 5) score += 3
        else if (lastMealHours >= 3) score += 2
        else if (lastMealHours >= 2) score += 1

        // low energy can be a sign of hunger
        if (energyLevel === "low") score += 1

        // physical stomach feelings support real hunger
        if (stomachFeeling === "yes") score += 2

        // wanting one exact food points more to a craving
        if (wantSpecificFood === "yes") score -= 2

        const isHungry = score >= 5

        let summary = ""
        if (isHungry) {
            summary = "This looks like real hunger. We should guide you to a full meal."
        } else {
            summary = "This looks more like a craving. We will guide you to do a craving check."
        }

        return {
            score,
            isHungry,
            summary,
        }
    }, [hungerLevel, lastMealHours, energyLevel, wantSpecificFood, stomachFeeling])

    const handleContinue = () => {
        // show and save the result message before moving pages
        setResultMessage(hungerAnalysis.summary)

        if (hungerAnalysis.isHungry) {
            // send hungry result to Daily Log and request the hunger popup
            router.push("/daily-log?action=hunger")
            return
        }

        // send craving result to Daily Log and request the craving popup
        router.push("/daily-log?action=craving")
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl rounded-xl border p-8 shadow-sm space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-semibold">
                        Hunger Check
                    </h1>

                    <p className="text-gray-500">
                        Answer these questions so NutriAI can tell if you need a real meal or if this is more likely a craving.
                    </p>
                </div>

                {/* hunger level question */}
                <div className="space-y-2">
                    <label className="block font-medium">
                        How hungry do you feel right now?
                    </label>

                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={hungerLevel}
                        onChange={(e) => setHungerLevel(Number(e.target.value))}
                        className="w-full"
                    />

                    {/* hunger scale */}
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Not hungry</span>
                        <span>Extremely hungry</span>
                    </div>

                    {/* selected hunger level */}
                    <p className="text-sm text-gray-600 text-center">
                        {
                            hungerLevel === 1 ? "Not hungry" :
                                hungerLevel === 2 ? "Slightly hungry" :
                                    hungerLevel === 3 ? "Moderately hungry" :
                                        hungerLevel === 4 ? "Very hungry" :
                                            "Extremely hungry"
                        }
                    </p>
                </div>

                {/* Time since last meal question */}
                <div className="space-y-2">
                    <label className="block font-medium">
                        How many hours since your last meal?
                    </label>

                    <input
                        type="number"
                        min="0"
                        value={lastMealHours}
                        onChange={(e) => setLastMealHours(Number(e.target.value))}
                        className="w-full rounded-lg border p-3"
                    />
                </div>

                {/* energy level question */}
                <div className="space-y-2">
                    <label className="block font-medium">
                        What is your energy level right now?
                    </label>

                    <select
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(e.target.value)}
                        className="w-full rounded-lg border p-3"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {/* stomach signs question */}
                <div className="space-y-2">
                    <label className="block font-medium">
                        Do you feel physical signs of hunger like an empty stomach, stomach growling, or feeling weak?
                    </label>

                    <select
                        value={stomachFeeling}
                        onChange={(e) => setStomachFeeling(e.target.value)}
                        className="w-full rounded-lg border p-3"
                    >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>

                {/* specific food question */}
                <div className="space-y-2">
                    <label className="block font-medium">
                        Are you thinking about one very specific food?
                    </label>

                    <select
                        value={wantSpecificFood}
                        onChange={(e) => setWantSpecificFood(e.target.value)}
                        className="w-full rounded-lg border p-3"
                    >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </div>

                {/* hunger result section */}
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">
                        Your Hunger Result
                    </h2>

                    <p className="text-sm text-gray-500">
                        Based on your answers, here is what NutriAI thinks:
                    </p>

                    {/* result box */}
                    <div className="rounded-xl bg-gray-50 p-4 space-y-2">
                        <p className="text-sm text-gray-600">
                            Score: {hungerAnalysis.score}
                        </p>

                        <p className="text-sm text-gray-600">
                            {hungerAnalysis.summary}
                        </p>
                    </div>
                </div>

                {/* continue button */}
                <button
                    onClick={handleContinue}
                    className="w-full rounded-lg bg-black px-6 py-3 text-white"
                >
                    Continue
                </button>

                {/* saved result message */}
                {resultMessage ? (
                    <p className="text-center text-sm text-gray-500">
                        {resultMessage}
                    </p>
                ) : null}
            </div>
        </main>
    )
}