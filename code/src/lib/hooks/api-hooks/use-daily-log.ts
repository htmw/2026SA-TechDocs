"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientHungerEvent, ClientCravingEvent, ClientDailyLog } from "@/lib/types/mongo_daily_log_types";
import callApi from "@/lib/api";
import { format } from "date-fns";

interface DailyLogsResponse {
    daily_logs: ClientDailyLog[];
}

interface DailyLogResponse {
    daily_log: ClientDailyLog;
}

export type CreateDailyLogInput = Pick<
    ClientDailyLog,
    "date" | "timezone" | "morning_weight" | "energy_rating" | "sleep_hours" | "stress_level"
>;

export function useDailyLogs(start_date?: Date, end_date?: Date) {
    const formatted_start_date = start_date ? format(start_date, "yyyy-MM-dd") : undefined;
    const formatted_end_date = end_date ? format(end_date, "yyyy-MM-dd") : undefined;
    return useQuery<ClientDailyLog[], Error>({
        queryKey: ["dailyLogs", formatted_start_date, formatted_end_date],
        queryFn: async () => {
            const res = await callApi<DailyLogsResponse>(`/api/health/daily-logs?start_date=${formatted_start_date}&end_date=${formatted_end_date}`);
            return res.daily_logs;
        }
    });
}

export function useDailyLog(date: Date) {
    const formatted_date = format(date, "yyyy-MM-dd");
    return useQuery<ClientDailyLog, Error>({
        queryKey: ["dailyLog", formatted_date],
        queryFn: async () => {
            const res = await callApi<DailyLogResponse>(`/api/health/daily-logs/${formatted_date}`);
            return res.daily_log;
        }
    });
}

export function useCreateDailyLog() {
    const qc = useQueryClient();

    return useMutation<ClientDailyLog, Error, CreateDailyLogInput, unknown>({
        mutationFn: (input) =>
            callApi<DailyLogResponse>(`/api/health/daily-logs`, {
                method: "POST",
                body: JSON.stringify(input),
            }).then((res) => res.daily_log),
        onSuccess: (_data: ClientDailyLog, variables) => {
            qc.invalidateQueries({ queryKey: ["dailyLogs"] });
            qc.invalidateQueries({ queryKey: ["dailyLog", variables.date] });
        },
    });
}