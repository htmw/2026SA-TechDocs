"use client"

import { useState } from "react"

export default function CravingPage() { // shows options after a craving is detected

    const [showDistractions, setShowDistractions] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-6">

            <h1 className="text-3xl font-semibold">
                Craving Detected
            </h1>

            <p className="text-gray-500 text-center max-w-md">
                This looks like a craving, not real hunger. You can choose how you want to handle it.
            </p>

            {/* option to give in to the craving */}
            <div className="w-full max-w-md space-y-2">
                <h2 className="text-lg font-semibold">
                    Give In Option
                </h2>

                <div className="border p-6 rounded-xl text-center space-y-3">
                    <p className="text-sm text-gray-500">
                        If you choose this, we will still help you stay within your goals.
                    </p>

                    <button className="bg-gray-800 text-white py-2 px-4 rounded-lg w-full">
                        Log what I am craving
                    </button>
                </div>
            </div>

            {/* better food choice */}
            <div className="w-full max-w-md space-y-2">
                <h2 className="text-xl font-semibold">
                    Better Alternative
                </h2>

                <div className="border p-6 rounded-xl text-center space-y-3">
                    <p>Greek Yogurt with Honey</p>

                    <p className="text-sm text-gray-500">
                        High protein and helps reduce sugar cravings
                    </p>

                    <button className="bg-purple-600 text-white py-2 px-4 rounded-lg w-full">
                        Try this instead
                    </button>
                </div>
            </div>

            {/* reminder to stay focused */}
            <div className="w-full max-w-md space-y-2">
                <h2 className="text-lg font-semibold">
                    Stay On Track
                </h2>

                <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-600">
                        You have been consistent. One decision right now keeps you on track.
                    </p>
                </div>
            </div>

            {/* current goal progress */}
            <div className="w-full max-w-md space-y-2">
                <h2 className="text-lg font-semibold">
                    Your Goal
                </h2>

                <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <p className="text-sm text-gray-600">
                        Goal: Lose weight | Progress: 65 percent complete
                    </p>
                </div>
            </div>

            {/* distraction ideas */}
            <div className="w-full max-w-md space-y-2 text-center">
                <h2 className="text-lg font-semibold">
                    Try a Distraction
                </h2>

                <button
                    onClick={() => setShowDistractions(!showDistractions)}
                    className="border py-2 px-4 rounded-lg w-full"
                >
                    Show Distractions
                </button>

                {showDistractions && (
                    <ul className="mt-3 text-sm text-gray-600 space-y-2">
                        <li>Go for a 5 minute walk</li>
                        <li>Drink a glass of water</li>
                        <li>Brush your teeth</li>
                        <li>Do a quick task or reset your focus</li>
                    </ul>
                )}
            </div>

            {/* craving result from the user */}
            <div className="w-full max-w-md space-y-2 text-center">
                <h2 className="text-lg font-semibold">
                    Craving Outcome
                </h2>

                <p className="text-sm text-gray-600">
                    Did you fight the craving?
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => setSuccess("yes")}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                    >
                        Yes
                    </button>

                    <button
                        onClick={() => setSuccess("no")}
                        className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                    >
                        No
                    </button>
                </div>

                {success && (
                    <p className="text-sm text-gray-500">
                        {success === "yes"
                            ? "Great job staying on track."
                            : "That is okay. We will adjust next time."}
                    </p>
                )}
            </div>

        </main>
    )
}