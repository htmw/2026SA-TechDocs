"use client"

import callApi from "@/lib/api";
import { ClientCravingEvent } from "@/lib/types/mongo_daily_log_types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns/format";

interface CravingEventResponse {
    craving_events: ClientCravingEvent[];
}

export function useCravingEvents(formatted_date: string) {
    return useQuery<ClientCravingEvent[], Error>({
        queryKey: ["cravingEvents", formatted_date],
        queryFn: async () => {
            const res = await callApi<CravingEventResponse>(`/api/health/daily-logs/${formatted_date}/craving-events`);
            return res.craving_events;
        }
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