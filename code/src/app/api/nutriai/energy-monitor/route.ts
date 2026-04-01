// src/app/api/nutriai/energy-monitor/route.ts

import { NextResponse } from "next/server"

export async function POST(request: Request) {

  try {

    const body = await request.json()

    const sleepHours = Number(body.sleepHours)
    const currentEnergyLevel = Number(body.currentEnergyLevel)
    const fitnessLevel = body.fitnessLevel

    // -----------------------------
    // Basic Demo Energy Score
    // This is placeholder logic for demo
    // -----------------------------

    let energyScore = 50

    if (!isNaN(sleepHours)) {
      energyScore += sleepHours * 5
    }

    if (!isNaN(currentEnergyLevel)) {
      energyScore += currentEnergyLevel * 3
    }

    if (fitnessLevel === "Active") {
      energyScore += 10
    }

    if (fitnessLevel === "Sedentary") {
      energyScore -= 10
    }

    // Clamp energy score between 0 and 100
    energyScore = Math.max(0, Math.min(100, energyScore))

    return NextResponse.json({
      energyScore
    })

  } catch (error) {

    return NextResponse.json(
      { message: "Energy calculation error." },
      { status: 500 }
    )

  }
}