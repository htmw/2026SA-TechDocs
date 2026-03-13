"use client";

import * as React from "react";
import {
    Clock3,
    Flame,
    Zap,
    Siren,
    Trash,
} from "lucide-react";

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ClientCravingEvent, ClientHungerEvent } from "@/lib/types/mongo_daily_log_types";
import { craving_intensity_label_map, craving_trigger_label_map, craving_type_label_map, hunger_level_label_map } from "@/lib/zod_schemas/health_schema";
import { format } from "date-fns";

type EventsCardProps<T> = {
    events: T[];
    title: string;
    description: string;
    icon: React.ReactNode;
    empty_label: string;
    renderAccordionItem: (
        event: T,
        onDelete?: (date: string, id: string) => void
    ) => React.ReactNode;
    onDelete?: (date: string, id: string) => void;
};

function EmptyState({ label }: { label: string }) {
    return (
        <Card className="border border-dashed shadow-none">
            <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">{label}</p>
            </CardContent>
        </Card>
    );
}

function SuggestedActions({ actions }: { actions: string[] }) {
    if (!actions.length) {
        return (
            <p className="text-sm text-muted-foreground">No suggested actions available.</p>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
                <Badge
                    key={`${action}-${index}`}
                    variant="outline"
                >
                    {action}
                </Badge>
            ))}
        </div>
    );
}

function EventDetailItem({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}

type EventAccordionItemProps = {
    id: string;
    icon: React.ReactNode;
    event_label: string;
    occurred_at: Date;
    badge_content: React.ReactNode;
    detail_items: Array<{ label: string; value: React.ReactNode }>;
    suggested_actions: string[];
    onDelete?: (date: string, id: string) => void;
};

function EventAccordionItem({
    id,
    icon,
    event_label,
    occurred_at,
    badge_content,
    detail_items,
    suggested_actions,
    onDelete,
}: EventAccordionItemProps) {
    return (
        <AccordionItem
            value={id}
            className="rounded-2xl border last:border-b-1 bg-background"
        >
            <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex flex-1 items-center justify-between gap-3 pr-4">
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            {icon}
                            <span className="text-sm">{event_label}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 className="size-3" />
                            <span>{occurred_at.toLocaleString()}</span>
                        </div>
                    </div>

                    <Badge variant="secondary">
                        {badge_content}
                    </Badge>
                </div>
            </AccordionTrigger>

            <AccordionContent className="px-4">
                <Card className="rounded-2xl shadow-none">
                    <CardContent className="space-y-4 px-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {detail_items.map((item, idx) => (
                                <EventDetailItem
                                    key={idx}
                                    label={item.label}
                                    value={item.value}
                                />
                            ))}
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <p className="text-sm font-medium">Suggested Actions</p>
                            <div className="flex flex-row justify-between items-center">
                                <SuggestedActions actions={suggested_actions} />
                                {onDelete && (
                                    <div className="flex justify-end">
                                        <Button
                                            className="text-sm text-red-600 bg-red-600/30 hover:bg-red-600/50 rounded-full"
                                            onClick={() => onDelete(format(occurred_at, "yyyy-MM-dd"), id)}
                                        >
                                            <Trash className="size-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
    );
}

function EventsCard<T>({
    events,
    title,
    description,
    icon,
    empty_label,
    renderAccordionItem,
    onDelete,
}: EventsCardProps<T>) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>

                <CardAction>
                    <Badge variant="secondary">
                        {events.length}
                    </Badge>
                </CardAction>
            </CardHeader>

            <CardContent className="pr-2">
                {events.length === 0 ? (
                    <EmptyState label={empty_label} />
                ) : (
                    <ScrollArea className={"pr-4"}>
                        <Accordion type="single" collapsible className="space-y-3 max-h-[500px]">
                            {events.map((event) => 
                                renderAccordionItem(event, onDelete)
                            )}
                        </Accordion>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}

export function HungerEventsCard({
    events,
    onDelete,
}: {
    events: ClientHungerEvent[];
    onDelete?: (date: string, id: string) => void;
}) {
    return (
        <EventsCard
            events={events}
            title="Hunger Events"
            description="Logged hunger moments and recommended next steps."
            icon={<Zap className="size-5 text-muted-foreground" />}
            empty_label="No hunger events logged yet."
            renderAccordionItem={(event, onDelete) => (
                <EventAccordionItem
                    key={event._id}
                    id={event._id}
                    icon={<Flame className="size-4 text-muted-foreground" />}
                    event_label="Hunger Event"
                    occurred_at={new Date(event.occurred_at)}
                    badge_content={hunger_level_label_map[event.hunger_level]}
                    detail_items={[
                        { label: "Occurred At", value: new Date(event.occurred_at).toLocaleString() },
                        { label: "Hunger Level", value: hunger_level_label_map[event.hunger_level] },
                    ]}
                    suggested_actions={event.suggested_actions}
                    onDelete={onDelete}
                />
            )}
            onDelete={onDelete}
        />
    );
}

export function CravingEventsCard({
    events,
    onDelete,
}: {
    events: ClientCravingEvent[];
    onDelete?: (date: string, id: string) => void;
}) {
    return (
        <EventsCard
            events={events}
            title="Craving Events"
            description="Logged craving moments and recommended next steps."
            icon={<Zap className="size-5 text-muted-foreground" />}
            empty_label="No craving events logged yet."
            renderAccordionItem={(event, onDelete) => (
                <EventAccordionItem
                    key={event._id}
                    id={event._id}
                    icon={<Siren className="h-4 w-4 text-muted-foreground" />}
                    event_label="Craving Event"
                    occurred_at={new Date(event.occurred_at)}
                    badge_content={craving_intensity_label_map[event.intensity]}
                    detail_items={[
                        { label: "Occurred At", value: new Date(event.occurred_at).toLocaleString() },
                        { label: "Craving Type", value: craving_type_label_map[event.craving_type] },
                        { label: "Intensity", value: craving_intensity_label_map[event.intensity] },
                        { label: "Trigger", value: craving_trigger_label_map[event.trigger] },
                    ]}
                    suggested_actions={event.suggested_actions}
                    onDelete={onDelete}
                />
            )}
            onDelete={onDelete}
        />
    );
}