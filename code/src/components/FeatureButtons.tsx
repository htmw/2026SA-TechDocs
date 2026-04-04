"use client" // required because we use router

import { useRouter } from "next/navigation"

export default function FeatureButtons() { // THIS makes it a module
    const router = useRouter()

    const handleHungry = () => {
        router.push("/hunger-check")
    }

    const handleCraving = () => {
        router.push("/craving")
    }

    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16">

            <h2 className="text-3xl font-semibold">
                Are you hungry or having a craving?
            </h2>

            <p className="text-gray-500 text-center max-w-md">
                Choose hungry for a real meal based on your needs, or craving if you want something specific so we can guide you without breaking your goals
            </p>

            <div className="flex gap-6">
                <button
                    onClick={handleHungry}
                    className="px-8 py-4 rounded-xl bg-green-600 text-white"
                >
                    I&apos;m Hungry
                </button>

                <button
                    onClick={handleCraving}
                    className="px-8 py-4 rounded-xl bg-purple-600 text-white"
                >
                    I&apos;m Craving
                </button>
            </div>
        </div>
    )
}