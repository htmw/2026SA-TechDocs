import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { format, parse, startOfDay } from "date-fns";
import { tz, TZDate } from "@date-fns/tz";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function normalizeDateToTimezoneDay(date: string, timeZone: string) {
    //Date must be in Year-Month-Day format, e.g. 2026-03-13
    const parsed = parse(date, 'yyyy-MM-dd', new Date());
    const midnight = new TZDate(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
        timeZone
    );

    return startOfDay(midnight, { in: tz(timeZone) });
}

export function getTimezoneDayString(date: Date, timeZone: string) {
    return format(
        date,
        "yyyy-MM-dd"
    );
}