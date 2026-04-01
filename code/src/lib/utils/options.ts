export interface Option<T extends string | number> {
    label: string;
    value: T;
}

export type OptionList<T extends string | number> = Option<T>[];

export function makeLabelMap<T extends string | number>(
    opts: OptionList<T>
): Record<T, string> {
    return Object.fromEntries(
        opts.map((option) => [option.value, option.label])
    ) as Record<T, string>;
}

// Occupation options used in the profile form dropdown.
// Each option provides a display label and the value stored in the database.
export const occupation_options: OptionList<string> = [
    { label: "Student", value: "Student" },
    { label: "Software Developer", value: "Software Developer" },
    { label: "Nurse", value: "Nurse" },
    { label: "Teacher", value: "Teacher" },
    { label: "Engineer", value: "Engineer" },
    { label: "Construction Worker", value: "Construction Worker" },
    { label: "Retail Worker", value: "Retail Worker" },
    { label: "Manager", value: "Manager" },
    { label: "Unemployed", value: "Unemployed" },
    { label: "Other", value: "Other" },
];

// Hobby options used for multi-select in the profile form.
// Users can select multiple hobbies which are stored as an array of values
export const hobby_options: OptionList<string> = [
    { label: "Gym", value: "Gym" },
    { label: "Running", value: "Running" },
    { label: "Walking", value: "Walking" },
    { label: "Gaming", value: "Gaming" },
    { label: "Reading", value: "Reading" },
    { label: "Cooking", value: "Cooking" },
    { label: "Traveling", value: "Traveling" },
    { label: "Sports", value: "Sports" },
    { label: "Music", value: "Music" },
    { label: "None", value: "None" },
];