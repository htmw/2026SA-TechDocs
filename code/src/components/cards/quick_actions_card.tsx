"use client";

import { Flame, Sparkles, ClipboardCheck } from "lucide-react";
import { energy_rating, EnergyRating, stress_level } from "@/lib/enums";
import { StressLevel } from "@/lib/enums";

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCreateDailyLog, useDailyLogStatus } from "@/lib/hooks/api-hooks/use-daily-log";
import React from "react";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { tz } from "@date-fns/tz";

type QuickActionsCardProps = {
    onCraving?: () => void;
    onHungry?: () => void;
    onCheckIn?: () => void;
};

export function QuickActionsCard({
    onCraving,
    onHungry,
    onCheckIn,
}: QuickActionsCardProps) {
    const [checking, setChecking] = useState(false)
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<string[]>([])

    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";

    const prompts = [
    {
        question: "How many hours of sleep did you get last night?",
        responses: ["0","1","2","3","4","5","6","7","8","9"].map(n => ({ key: n, label: n }))
    },
    {
        question: "What is your current energy level?",
        responses: Object.entries(energy_rating.map).map(([key, label]) => ({ key, label }))
    },
    {
        question: "What is your current stress level?",
        responses: Object.entries(stress_level.map).map(([key, label]) => ({ key, label }))
    },
    {
        question: "What was your weight this morning?",
        responses: ["200"].map(n => ({ key: n, label: n }))
    },
    ]
    const [selected_date, setSelectedDate] = React.useState(new Date());
        const [week_start, setWeekStart] = React.useState(startOfWeek(selected_date, { weekStartsOn: 0 }));
        const [week_end, setWeekEnd] = React.useState(endOfWeek(selected_date, { weekStartsOn: 0 }));
    
    const { data: day_status_data = [], isLoading: loading_day_statuses } = useDailyLogStatus({
        startDate: week_start,
        endDate: week_end,
        status: "daily_checkins",
    });
    const day_status_array = day_status_data.map(status => status.date);
    
    const createDailyLog = useCreateDailyLog()

    function handleCheckIn() {
        const formatted_selected_date = format(selected_date, "yyyy-MM-dd", { in: tz(timezone), });
        
        if (day_status_array.includes(formatted_selected_date)) {
            return;
        }
        setChecking(true)
        setStep(0)
        setAnswers([])
    }

    function answer(response: string | EnergyRating | StressLevel) {
        const newAnswers = [...answers, response]
        setAnswers(newAnswers)

        if (step < prompts.length - 1) {  
        setStep(step + 1)
        } else {
        createDailyLog.mutate({
            date: new Intl.DateTimeFormat('en-CA').format(new Date()),
            timezone: "America/New_York",
            morning_weight: parseFloat(newAnswers[3]), 
            energy_rating: newAnswers[1] as EnergyRating,
            sleep_hours: parseInt(newAnswers[0]),
            stress_level: newAnswers[2] as StressLevel,
        })
        setChecking(false)
        }
    }
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                    Quickly log hunger signals or complete your daily check-in.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
                    <Button
                        variant="default"
                        className="flex items-center gap-2"
                        onClick={onCraving}
                    >
                        <Sparkles />
                        I'm Craving
                    </Button>

                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={onHungry}
                    >
                        <Flame />
                        I'm Hungry
                    </Button>

                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={handleCheckIn}
                    >
                        <ClipboardCheck />
                        Check In
                    </Button>
                    
                </div>
                {checking && (
                        <div className="flex flex-col gap-2 sm:items-center sm:justify-center">
                            <br />
                            <p>{prompts[step].question}</p>
                            {prompts[step].responses.map(({ key, label }) => (
                            <div>
                            <Button
                                key={key} 
                                className="w-lg mt-2"
                                variant="outline"
                                onClick={() => answer(key)}>
                                {label}
                            </Button>
                            </div>))}
                        </div>
                        )}
            </CardContent>
        </Card>
    );
}