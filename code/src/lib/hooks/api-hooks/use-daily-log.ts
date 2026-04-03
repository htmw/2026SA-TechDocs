"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientHungerEvent, ClientCravingEvent, ClientDailyLog } from "@/lib/types/mongo_daily_log_types";
import callApi from "@/lib/api";
import { format } from "date-fns";

interface DailyLogsResponse {
    daily_logs: ClientDailyLog[];
}

interface DailyLogStatusItem {
    date: string;
    daily_checkins?: boolean;
    meals?: number;
    hunger_events?: number;
    craving_events?: number;
}

interface DailyLogStatusResponse {
    days: DailyLogStatusItem[];
}

interface DailyLogResponse {
    daily_log: ClientDailyLog;
}

export type CreateDailyLogInput = Pick<
    ClientDailyLog,
    "date" | "timezone" | "morning_weight" | "energy_rating" | "sleep_hours" | "stress_level"
>;

export interface DailyLogsQueryOptions {
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortField?: string;
    sortDir?: "asc" | "desc";
}

export interface DailyLogStatusOptions {
    startDate: Date;
    endDate?: Date;
    status?: "daily_checkins" | "meals" | "hunger_events" | "craving_events";
}

export function useDailyLogs(options?: DailyLogsQueryOptions) {
    const { startDate, endDate, page, limit, sortField, sortDir } = options || {};
    const formatted_start_date = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
    const formatted_end_date = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

    return useQuery<ClientDailyLog[], Error>({
        queryKey: ["dailyLogs", formatted_start_date, formatted_end_date, page, limit, sortField, sortDir],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (formatted_start_date) params.append("start_date", formatted_start_date);
            if (formatted_end_date) params.append("end_date", formatted_end_date);
            if (page !== undefined) params.append("page", page.toString());
            if (limit !== undefined) params.append("limit", limit.toString());
            if (sortField) params.append("sort_field", sortField);
            if (sortDir) params.append("sort_dir", sortDir);

            const queryString = params.toString();
            const res = await callApi<DailyLogsResponse>(`/api/health/daily-logs${queryString ? `?${queryString}` : ""}`);
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

export function useDailyLogStatus(options: DailyLogStatusOptions) {
    const { startDate, endDate, status = "daily_checkins" } = options;
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

    return useQuery<DailyLogStatusItem[], Error>({
        queryKey: ["dailyLogStatus", formattedStartDate, formattedEndDate, status],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append("start_date", formattedStartDate);
            if (formattedEndDate) params.append("end_date", formattedEndDate);
            params.append("status", status);

            const res = await callApi<DailyLogStatusResponse>(`/api/health/daily-logs/status?${params.toString()}`);
            return res.days;
        },
    });
}