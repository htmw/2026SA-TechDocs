"use client"

import callApi from "@/lib/api";
import { ClientHungerEvent } from "@/lib/types/mongo_daily_log_types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns/format";

interface HungerEventResponse {
    hunger_events: ClientHungerEvent[];
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