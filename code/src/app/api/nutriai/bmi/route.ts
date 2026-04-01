// code/src/app/api/nutriai/bmi/route.ts

import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {

        const body = await request.json()

        const height = Number(body.height)
        const weight = Number(body.weight)

        // Validate input
        if (!height || !weight || height <= 0 || weight <= 0) {
            return NextResponse.json(
                { message: "Height and weight must be valid numbers." },
                { status: 400 }
            )
        }

        // BMI formula (lbs / inches)
        const bmi = (weight * 703) / (height * height)

        return NextResponse.json({
            bmi: Number(bmi.toFixed(1))
        })

    } catch {
        return NextResponse.json(
            { message: "BMI calculation error." },
            { status: 500 }
        )
    }
}