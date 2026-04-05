"use client"

export default function CravingPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 gap-6">

            <h1 className="text-3xl font-semibold">
                Craving Detected
            </h1>

            <p className="text-gray-500 text-center max-w-md">
                You are likely experiencing a craving. This is not true hunger.
            </p>

            <div className="border p-6 rounded-xl w-full max-w-md text-center space-y-3">
                <h2 className="text-xl font-semibold">
                    Suggested Alternative
                </h2>

                <p>Greek Yogurt with Honey</p>

                <p className="text-sm text-gray-500">
                    High protein and helps reduce sugar cravings
                </p>

                <button className="bg-purple-600 text-white py-2 px-4 rounded-lg w-full">
                    Try this instead
                </button>
            </div>

        </main>
    )
}