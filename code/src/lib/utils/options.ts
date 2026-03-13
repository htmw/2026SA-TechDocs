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
