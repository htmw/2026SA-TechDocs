"use client" 

import { useState } from "react"

export default function HungryPage() { // shows meal suggestion for when user is hungry
    const [hungerLevel, setHungerLevel] = useState(3)

    // sample meal shown on the page
    const meal = {
        name: "Grilled Chicken Bowl",
        calories: 520,
        protein: 40,
        carbs: 45,
        fat: 18,
        reason: "Fits your calorie target and supports energy"
    }

    return (
        <main className="min-h-screen flex flex-col items-center px-6 py-12 gap-8">

            {/* page title */}
            <h1>You are Hungry</h1>

            {/* current food info */}
            <div>
                Calories remaining: 1200 | Energy: Medium | Time: Lunch
            </div>

            {/* hunger level slider */}
            <div className="flex flex-col items-center gap-2">
                <label className="text-sm text-gray-600">
                    How hungry are you?
                </label>

                <input
                    type="range"
                    min="1"
                    max="5"
                    value={hungerLevel}
                    onChange={(e) => setHungerLevel(Number(e.target.value))}
                />

                {/* shows current hunger level */}
                <span className="text-sm text-gray-500">
                    Level: {hungerLevel}
                </span>
            </div>

            {/* meal suggestion card */}
            <div className="w-full max-w-md border rounded-xl p-6 shadow-sm flex flex-col gap-3">

                {/* meal name */}
                <h2 className="text-xl font-semibold">
                    {meal.name}
                </h2>

                {/* short reason for recommendation */}
                <p className="text-gray-500 text-sm">
                    {meal.reason}
                </p>

                {/* meal nutrition details */}
                <div className="text-sm text-gray-600">
                    {meal.calories} cal | {meal.protein}g protein | {meal.carbs}g carbs | {meal.fat}g fat
                </div>

                {/* action buttons */}
                <div className="flex gap-3 mt-3">

                    <button className="flex-1 bg-green-600 text-white py-2 rounded-lg">
                        Eat this
                    </button>

                    <button className="flex-1 border py-2 rounded-lg">
                        Swap
                    </button>

                </div>
            </div>

        </main>
    )
}