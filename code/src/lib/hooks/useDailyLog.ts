"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientHungerEvent, ClientCravingEvent, ClientDailyLog } from "@/lib/types/mongo_daily_log_types";
import callApi from "@/lib/api";
import { format } from "date-fns";
import { ApiResponse } from "@/lib/types/shared";

interface HungerEventResponse {
    hunger_events: ClientHungerEvent[];
}

interface CravingEventResponse {
    craving_events: ClientCravingEvent[];
}

interface DailyLogsResponse {
    daily_logs: ClientDailyLog[];
}

interface DailyLogResponse {
    daily_log: ClientDailyLog;
}

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

export function useHungerEvents(date: Date) {
    const formatted_date = format(date, "yyyy-MM-dd");
    return useQuery<ClientHungerEvent[], Error>({
        queryKey: ["hungerEvents", formatted_date],
        queryFn: async () => {
            const res = await callApi<HungerEventResponse>(`/api/health/daily-logs/${formatted_date}/hunger-events`);
            return res.hunger_events;
        }
    });
}

export function useCravingEvents(date: Date) {
    const formatted_date = format(date, "yyyy-MM-dd");
    return useQuery<ClientCravingEvent[], Error>({
        queryKey: ["cravingEvents", formatted_date],
        queryFn: async () => {
            const res = await callApi<CravingEventResponse>(`/api/health/daily-logs/${formatted_date}/craving-events`);
            return res.craving_events;
        }
    });
}

export function useDeleteHungerEvent() {
    const qc = useQueryClient();

    return useMutation<null, Error, { date: string; id: string }, unknown>({
        mutationFn: ({ date, id }) =>
            callApi<null>(`/api/health/daily-logs/${date}/hunger-events/${id}`, { method: "DELETE" }),
        onSuccess: (_data: null) => {
            qc.invalidateQueries({ queryKey: ["hungerEvents"] });
        },
        onError: (error: Error) => {
            console.error("Error deleting hunger event:", error.message);
        }
    });
}

// mirror the hunger hook but operate on cravings
export function useDeleteCravingEvent() {
    const qc = useQueryClient();

    return useMutation<null, Error, { date: string; id: string }, unknown>({
        mutationFn: ({ date, id }) =>
            callApi<null>(`/api/health/daily-logs/${date}/craving-events/${id}`, { method: "DELETE" }),
        onSuccess: (_data: null) => {
            qc.invalidateQueries({ queryKey: ["cravingEvents"] });
        },
    });
}

export function useCreateCravingEvent() {
    const qc = useQueryClient();

    return useMutation<
        ClientCravingEvent,
        Error,
        { date: string; event: Omit<ClientCravingEvent, "_id"> },
        unknown
    >({
        mutationFn: ({ date, event }) =>
            callApi<ClientCravingEvent>(`/api/health/daily-logs/${date}/craving-events`, {
                method: "POST",
                body: JSON.stringify(event),
            }),
        onSuccess: (_data: ClientCravingEvent, variables) => {
            qc.invalidateQueries({ queryKey: ["cravingEvents", variables.date] });
        },
    });
}

export function useCreateHungerEvent() {
    const qc = useQueryClient();

    return useMutation<
        ClientHungerEvent,
        Error,
        { date: string; event: Omit<ClientHungerEvent, "_id"> },
        unknown
    >({
        mutationFn: ({ date, event }) =>
            callApi<ClientHungerEvent>(`/api/health/daily-logs/${date}/hunger-events`, {
                method: "POST",
                body: JSON.stringify(event),
            }),
        onSuccess: (_data: ClientHungerEvent, variables) => {
            qc.invalidateQueries({ queryKey: ["hungerEvents", variables.date] });
        },
    });
}

export type CreateDailyLogInput = Pick<
    ClientDailyLog,
    "date" | "timezone" | "morning_weight" | "energy_rating" | "sleep_hours" | "stress_level"
>;

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