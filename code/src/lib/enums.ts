/**
 * This function creates an object that stores a map of enum keys along with its display label
 *
 * Example:
 * ```ts
 * const current_energy = createLabeledEnum({
 *   low: "Low Energy",
 *   medium: "Mild Energy",
 *   high: "High Energy",
 * });
 *
 * type CurrentEnergy = keyof typeof current_energy.map; // this produces a type "low" | "medium" | "high"
 * const schema = z.enum(current_energy.values); // this produces a zod schema with the same string values, but typed as "low" | "medium" | "high"
 * ```
 *  1. The map is useful for looking up the display label for a given enum value
 *      e.g. "low" -> "Low Energy"
 *  2. The values array is useful for validating zod schemas
 *      e.g. z.enum(current_energy.values) will produce a schema that only accepts "low", "medium", or "high"
 *  3. The entries array is useful for iterating over the enum when rendering options like in the dropdown menu
 *      e.g. current_energy.entries.map(([value, label]) => <Option value={value} label={label} />)
 *
 * @param map A map mapping each enum key to its display label.
 * @returns An object containing the original map, a typed `values` array, and typed `entries`.
 */
export function createLabeledEnum<const T extends Record<string, string>>(map: T) {
    const values = Object.keys(map) as Array<keyof T>;

    return {
        map,
        values,
        entries: Object.entries(map) as [keyof T, string][],
    };
}

// Day of the week
export const day_of_week = createLabeledEnum({
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
} as const);
export type DayOfWeek = keyof typeof day_of_week.map;

/******************************************
 * 
 * PROFILE 
 * ENUMS, LABELS, AND TYPES
 * 
 *****************************************/

// Average Calories
export const avg_calories = createLabeledEnum({
    "lt-1000": "Less than 1000 Calories",
    "1000-1500": "1000-1500 Calories",
    "1500-2000": "1500-2000 Calories",
    "2000-2500": "2000-2500 Calories",
    "gt-2500": "More than 2500 Calories",
} as const);
export type AvgCalories = keyof typeof avg_calories.map;

// Fitness Level
export const fitness_level = createLabeledEnum({
    "0": "0 - Not active at all",
    "1": "1 - Light activity",
    "2": "2 - Moderate activity",
    "3": "3 - Active",
    "4": "4 - Very active",
    "5": "5 - Extremely active",
} as const);
export type FitnessLevel = keyof typeof fitness_level.map;

// Current Energy
export const current_energy = createLabeledEnum({
    low: "Low Energy",
    medium: "Mild Energy",
    high: "High Energy",
} as const);
export type CurrentEnergy = keyof typeof current_energy.map;

// Gender
export const gender = createLabeledEnum({
    male: "Male",
    female: "Female",
    other: "Other",
} as const);
export type Gender = keyof typeof gender.map;

// Average Sleep
export const avg_sleep = createLabeledEnum({
    "lt-5": "Less than 5 hours of sleep",
    "5-7": "5-7 hours of sleep",
    "7-9": "7-9 hours of sleep",
    "9-11": "9-11 hours of sleep",
    "gt-11": "More than 11 hours of sleep",
} as const);
export type AvgSleep = keyof typeof avg_sleep.map;


/******************************************
 * 
 * HEALTH 
 * ENUMS, LABELS, AND TYPES
 * 
 *****************************************/

// Energy Rating
export const energy_rating = createLabeledEnum({
    tired: "Tired",
    normal: "Normal",
    energetic: "Energetic",
} as const);
export type EnergyRating = keyof typeof energy_rating.map;

// Stress Level
export const stress_level = createLabeledEnum({
    relaxed: "Relaxed",
    low: "Low",
    moderate: "Moderate",
    high: "High",
} as const);
export type StressLevel = keyof typeof stress_level.map;

// Meal Type
export const meal_type = createLabeledEnum({
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
} as const);
export type MealType = keyof typeof meal_type.map;

// Food Type
export const food_type = createLabeledEnum({
    Recipe: "Recipe",
    Food: "Food",
    // Custom: "Custom", //future feature to allow users to add custom meals
} as const);
export type FoodType = keyof typeof food_type.map;

// Hunger Level
export const hunger_level = createLabeledEnum({
    little: "Little",
    hungry: "Hungry",
    starving: "Starving",
} as const);
export type HungerLevel = keyof typeof hunger_level.map;

// Craving Intensity
export const craving_intensity = createLabeledEnum({
    mild: "Mild",
    moderate: "Moderate",
    strong: "Strong",
} as const);
export type CravingIntensity = keyof typeof craving_intensity.map;

// Craving Type
export const craving_type = createLabeledEnum({
    sweet: "Sweet",
    salty: "Salty",
    savory: "Savory",
    spicy: "Spicy",
    protein: "Protein",
    light: "Light",
    other: "Other",
} as const);
export type CravingType = keyof typeof craving_type.map;

// Craving Trigger
export const craving_triggers = createLabeledEnum({
    stress: "Stress",
    boredom: "Boredom",
    tiredness: "Tiredness",
    emotional: "Emotional",
    habit: "Habit",
    late: "Late",
    other: "Other",
} as const);
export type CravingTrigger = keyof typeof craving_triggers.map;
