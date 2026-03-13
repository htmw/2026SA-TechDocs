"use client";

import * as React from "react";
import { addDays, addWeeks, endOfWeek, format, isSameDay, isToday, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SingleWeekPickerProps = {
    value?: Date;
    onChange?: (date: Date, start_week: Date, end_week: Date) => void;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    day_statuses?: string[];
};

function toDateKey(date: Date) {
    return format(date, "yyyy-MM-dd");
}

export function SingleWeekPicker({
    value,
    onChange,
    weekStartsOn = 0,
    className,
    day_statuses = [],
}: SingleWeekPickerProps) {
    const [selectedDate, setSelectedDate] = React.useState<Date>(value ?? new Date());
    const [currentWeekDate, setCurrentWeekDate] = React.useState<Date>(value ?? new Date());
    const [weekStart, setWeekStart] = React.useState<Date>(startOfWeek(currentWeekDate, { weekStartsOn }));
    const [weekEnd, setWeekEnd] = React.useState<Date>(endOfWeek(currentWeekDate, { weekStartsOn }));

    React.useEffect(() => {
        if (value) {
            setSelectedDate(value);
            setCurrentWeekDate(value);
        }
    }, [value]);

    React.useEffect(() => {
        if (currentWeekDate) {
            const weekStart = startOfWeek(currentWeekDate, { weekStartsOn });
            const weekEnd = endOfWeek(currentWeekDate, { weekStartsOn });
            setWeekStart(weekStart);
            setWeekEnd(weekEnd);

            onChange?.(selectedDate, weekStart, weekEnd);
        }
    }, [currentWeekDate]);

    const displayedSelectedDate = value ?? selectedDate;

    const days = React.useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }, [weekStart]);

    const handleSelect = (date: Date) => {
        if (!value) {
            setSelectedDate(date);
        }
        onChange?.(date, weekStart, weekEnd);
    };

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="tracking-tight">
                    {format(currentWeekDate, "MMMM yyyy")}
                </CardTitle>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => setCurrentWeekDate((prev) => addWeeks(prev, -1))}
                    >
                        <ChevronLeft />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => setCurrentWeekDate((prev) => addWeeks(prev, 1))}
                    >
                        <ChevronRight />
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex justify-center gap-2">
                    {days.map((day) => {
                        const key = toDateKey(day);
                        const completed = day_statuses.includes(key);
                        const selected = isSameDay(day, displayedSelectedDate);
                        const today = isToday(day);

                        return (
                            <div className="flex flex-col items-center gap-2" key={key}>
                                <p
                                    className={cn(
                                        "text-xs uppercase text-muted-foreground",
                                        selected && "text-foreground"
                                    )}
                                >
                                    {format(day, "EEE")}
                                </p>
                                <Button
                                    variant="ghost"
                                    asChild
                                    size="icon"
                                    onClick={() => handleSelect(day)}
                                    className="rounded-full"
                                >

                                    <div
                                        className={cn(
                                            " hover:scale-[1.05]",

                                            today && !completed &&
                                            "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",

                                            today && completed &&
                                            "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",

                                            !today && completed &&
                                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",

                                            selected && "ring-2 ring-blue-500"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </div>
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}