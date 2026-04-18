import { MealSummary } from "@/components/cards/meals_card";

export type NutrientGuidelines = {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    iron: number; // in mg
    vitaminc: number; // in mg
};

export type NutrientGapStatus = "deficient" | "borderline" | "optimal" | "surplus";

export type NutrientGap = {
    nutrient: string;
    current: number;
    target: number;
    unit: string;
    status: NutrientGapStatus;
    recommendation: string;
};

// Simplistic guideline generation based on generic goals
export function calculateDietaryGuidelines(profile?: any, goals?: string[]): NutrientGuidelines {
    // defaults
    let calories = 2000;
    if (profile?.gender === "male") calories = 2500;
    
    // adjust by goals
    if (goals?.includes("weight_loss")) calories -= 300;
    if (goals?.includes("muscle_gain")) calories += 300;

    return {
        calories,
        protein: Math.round((calories * 0.3) / 4), // 30% from protein
        fat: Math.round((calories * 0.25) / 9), // 25% from fat
        carbs: Math.round((calories * 0.45) / 4), // 45% from carbs
        iron: profile?.gender === "female" ? 18 : 8,
        vitaminc: 90,
    };
}

export function analyzeNutrientGaps(meals: MealSummary[], guidelines: NutrientGuidelines): NutrientGap[] {
    let totalCals = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalIron = 0;
    let totalVitC = 0;

    for (const m of meals) {
        totalCals += (m.calories || 0);
        totalProtein += (m.protein || 0);
        totalFat += (m.fat || 0);
        totalCarbs += (m.carbs || 0);
        
        const vits = (m.vitamins || "").toLowerCase();
        if (vits.includes("iron")) totalIron += 3; // roughly adding 3mg per mention
        if (vits.includes("vitamin c")) totalVitC += 20; 

        const mins = (m.minerals || "").toLowerCase();
        if (mins.includes("iron")) totalIron += 3;
    }

    const gaps: NutrientGap[] = [];

    const evaluate = (name: string, cur: number, tgt: number, unit: string, highSource: string) => {
        let status: NutrientGapStatus = "optimal";
        let rec = "";
        const percentage = tgt > 0 ? (cur / tgt) * 100 : 100;

        if (percentage < 70) {
            status = "deficient";
            rec = `You are deficient in ${name}. Try adding ${highSource} to your next meal.`;
        } else if (percentage < 90) {
            status = "borderline";
            rec = `You are slightly low on ${name}. Consider adding ${highSource}.`;
        } else if (percentage <= 110) {
            status = "optimal";
            rec = `You're hitting your ${name} target. Keep it up!`;
        } else {
            status = "surplus";
            if (name === "Calories" || name === "Fat") {
                rec = `You are over your ${name} target. Consider lighter meals.`;
            } else {
                rec = `You have a surplus of ${name}, which is completely fine!`;
            }
        }
        gaps.push({ nutrient: name, current: cur, target: tgt, unit, status, recommendation: rec });
    };

    evaluate("Calories", totalCals, guidelines.calories, "kcal", "more portion sizes");
    evaluate("Protein", totalProtein, guidelines.protein, "g", "lean meats, beans, or tofu");
    evaluate("Fat", totalFat, guidelines.fat, "g", "nuts, avocados, or olive oil");
    evaluate("Carbs", totalCarbs, guidelines.carbs, "g", "whole grains, fruits, or potatoes");
    evaluate("Iron", totalIron, guidelines.iron, "mg", "spinach, lentils, or red meat");
    evaluate("Vitamin C", totalVitC, guidelines.vitaminc, "mg", "citrus fruits, bell peppers, or strawberries");

    return gaps;
}

export function calculateNutritionScore(gaps: NutrientGap[]): number {
    let score = 100;
    gaps.forEach(gap => {
        if (gap.status === "deficient") score -= 10;
        if (gap.status === "borderline") score -= 5;
        if (gap.status === "surplus" && (gap.nutrient === "Calories" || gap.nutrient === "Fat")) score -= 5;
    });
    return Math.max(0, score);
}
