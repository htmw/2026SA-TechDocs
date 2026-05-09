import { ClientUserProfile } from "@/lib/types/mongo_user_types";

export interface UserGoals {
    calorieIntake: number;
    proteinIntake: number;
    carbohydrateIntake: number;
    fatIntake: number;
}

export function calculateGoals(userProfile: ClientUserProfile | undefined, goals: string[] | undefined): UserGoals {
    //step 1: get user profile data
    const weight = userProfile?.weight || 0;
    const height = userProfile?.height || 0;
    const getAge = (dob: Date): number => {
        const today = new Date();
        const dobDate = new Date(dob as unknown as string);
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
        }

        return age;
    };

    // Usage
    const age = getAge(userProfile?.dob || new Date());
    const goal = goals?.[0] || "";
    const pace = goals?.[1] || "";

    //step 2: get bmr
    const weightKg = weight * 0.453592;
    const heightCm = height * 2.54;

    const bmr = userProfile?.gender === 'male'
        ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

    //step 3: get tdee
    const multiplier = userProfile?.fitness_level === 'sedentary' ? 1.2 :
        userProfile?.fitness_level === 'moderate' ? 1.55 :
            userProfile?.fitness_level === 'active' ? 1.725 : 1.9;

    const tdee = bmr * multiplier;

    //step 4: account for lose weight/gain muscle
    let calorieIntake = tdee; // default to maintain weight

    const paceAmount = pace === 'slow' ? 250 : pace === 'aggressive' ? 750 : 500;

    switch (goal) {
        case 'lose':
            calorieIntake -= paceAmount;
            break;
        case 'gain':
            calorieIntake += paceAmount;
            break;
        case 'energy':
            calorieIntake += paceAmount / 2; // energy boost is gentler
            break;
    }

    if (calorieIntake < 1200) {
        calorieIntake = 1200;
    }

    //step 5: protein/carb/fat breakdown
    const proteinMultiplier = { lose: 1.0, maintain: 0.8, gain: 1.2, energy: 0.8 }[goal] ?? 0.8;
    const fatPercent = goal === "gain" ? 0.35 : 0.30;

    const proteinIntake = Math.round(weight * proteinMultiplier);
    const fatIntake = Math.round((calorieIntake * fatPercent) / 9);
    const carbohydrateIntake = Math.round((calorieIntake - (proteinIntake * 4) - (fatIntake * 9)) / 4);

    //TODO: step 6: account for calories user had throughout week

    //step 7: return, include minimums
    return {
        calorieIntake: Math.round(calorieIntake),
        proteinIntake: proteinIntake,
        fatIntake: fatIntake,
        carbohydrateIntake: carbohydrateIntake,
    }
}