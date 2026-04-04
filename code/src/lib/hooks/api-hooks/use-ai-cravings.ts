// import { useMutation, useQueryClient } from "@tanstack/react-query";


// export function useCreateCravingEvent() {
//     const qc = useQueryClient();

//     return useMutation<
//         ClientCravingEvent,
//         Error,
//         { date: string; event: Omit<ClientCravingEvent, "_id"> },
//         unknown
//     >({
//         mutationFn: ({ date, event }) =>
//             callApi<ClientCravingEvent>(`/api/health/daily-logs/${date}/craving-events`, {
//                 method: "POST",
//                 body: JSON.stringify(event),
//             }),
//         onSuccess: (_data: ClientCravingEvent, variables) => {
//             qc.invalidateQueries({ queryKey: ["cravingEvents", variables.date] });
//         },
//     });
// }