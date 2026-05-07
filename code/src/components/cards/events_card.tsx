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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientCravingEvent, ClientHungerEvent } from "@/lib/types/mongo_daily_log_types";
import { format } from "date-fns";
import { craving_intensity, craving_triggers, craving_type, hunger_level, MealType } from "@/lib/enums";
import { useDeleteHungerEvent, useHungerEvents } from "@/lib/hooks/api-hooks/use-hunger-events";
import { useCravingEvents, useDeleteCravingEvent } from "@/lib/hooks/api-hooks/use-craving-events";
import { useCreateMeal } from "@/lib/hooks/api-hooks/use-meals";
import { useAuth } from "@/lib/hooks/useAuthProvider";
import { tz } from "@date-fns/tz";

type EventsCardProps<T> = {
    events: T[];
    title: string;
    description: string;
    icon: React.ReactNode;
    empty_label: string;
    renderAccordionItem: (
        event: T,
        onAdd?: (date: string, id: string, meal_type: MealType) => void,
        onDelete?: (date: string, id: string) => void,
    ) => React.ReactNode;
    onAdd?: (date: string, id: string, meal_type: MealType) => void;
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
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
                {actions.map((action, index) => (
                    <li
                        key={`${action}-${index}`}
                    >
                        {action}
                    </li>
                ))}
            </ul>
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
    badge_content?: React.ReactNode;
    detail_items: Array<{ label: string; value: React.ReactNode }>;
    suggested_actions: string[];
    onAdd?: (date: string, id: string, meal_type: MealType) => void;
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
    onAdd,
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

                    {badge_content && (
                        <Badge variant="secondary">
                            {badge_content}
                        </Badge>
                    )}
                </div>
            </AccordionTrigger>

            <AccordionContent className="px-4">
                <Card className="rounded-2xl shadow-none">
                    <CardContent className="space-y-4 px-4">
                        <div className="grid gap-3">
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
                                <div className="flex justify-end gap-2 items-center">
                                    {onAdd && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button className="text-sm rounded-full" variant="secondary">
                                                    Add meal
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onAdd?.(format(occurred_at, "yyyy-MM-dd"), id, "breakfast")}>Breakfast</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAdd?.(format(occurred_at, "yyyy-MM-dd"), id, "lunch")}>Lunch</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAdd?.(format(occurred_at, "yyyy-MM-dd"), id, "dinner")}>Dinner</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onAdd?.(format(occurred_at, "yyyy-MM-dd"), id, "snack")}>Snack</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                    {onDelete && (
                                        <Button
                                            className="text-sm text-red-600 bg-red-600/30 hover:bg-red-600/50 rounded-full"
                                            onClick={() => onDelete(format(occurred_at, "yyyy-MM-dd"), id)}
                                        >
                                            <Trash className="size-3" />
                                        </Button>
                                    )}
                                </div>
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
    onAdd,
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

            {events.length === 0 ? (
                <CardContent className="pr-6">
                    <EmptyState label={empty_label} />
                </CardContent>
            ) : (
                <CardContent className="pr-2">
                    <ScrollArea className={"pr-4"}>
                        <Accordion type="single" collapsible className="space-y-3 max-h-[500px]">
                            {events.map((event) =>
                                renderAccordionItem(event, onAdd, onDelete)
                            )}
                        </Accordion>
                    </ScrollArea>
                </CardContent>
            )}
        </Card>
    );
}

export function HungerEventsCard({
    date
}: {
    date: Date
}) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";
    const formatted_selected_date = format(date, "yyyy-MM-dd", { in: tz(timezone), });

    const { data: hunger_events = [], isLoading: loading_hunger } = useHungerEvents(date);
    const delete_hunger = useDeleteHungerEvent();

    const { mutate: create_meal } = useCreateMeal();

    const handleAddMeal = (date: string, id: string, meal_type: MealType) => {
        const event = hunger_events.find(event => event._id === id);
        if (!event) return; //throw error or something

        const recipe = event.recipe;

        create_meal({
            date: formatted_selected_date,
            meal: {
                meal_type: meal_type,
                food_item: recipe.title,
                calories: recipe.calories,
                protein: recipe.protein,
                carbohydrates: 0,
                fat: recipe.fat,
                fiber: 0,
                sugar: 0,
                sodium: recipe.sodium,
                cholesterol: 0,
                water_intake: 0,
                servings: 1,
                logged_at: new Date().toISOString(),
            }
        });
    }

    return (
        <EventsCard
            events={hunger_events}
            title="Hunger Events"
            description="Logged hunger moments and recommended next steps."
            icon={<Zap className="size-5 text-muted-foreground" />}
            empty_label="No hunger events logged yet."
            renderAccordionItem={(event, onAdd, onDelete) => (
                <EventAccordionItem
                    key={event._id}
                    id={event._id}
                    icon={<Flame className="size-4 text-muted-foreground" />}
                    event_label="Hunger Event"
                    occurred_at={new Date(event.occurred_at)}
                    detail_items={[
                        { label: "Occurred At", value: new Date(event.occurred_at).toLocaleString() },
                        { label: "Hunger Level", value: hunger_level.map[event.hunger_level] },
                    ]}
                    suggested_actions={event.suggested_actions}
                    onDelete={onDelete}
                    onAdd={onAdd}
                />
            )}
            onDelete={(date, id) => { delete_hunger.mutate({ date, id }) }}
            onAdd={handleAddMeal}
        />
    );
}

export function CravingEventsCard({
    date
}: {
    date: Date
}) {
    const { user } = useAuth();
    const timezone = user?.profile?.timezone || "UTC";
    const formatted_selected_date = format(date, "yyyy-MM-dd", { in: tz(timezone), });

    const { data: craving_events = [], isLoading: loading_craving } = useCravingEvents(date);
    const delete_craving = useDeleteCravingEvent();

    const { mutate: create_meal } = useCreateMeal();

    const handleAddMeal = (date: string, id: string, meal_type: MealType) => {
        const event = craving_events.find(event => event._id === id);
        if (!event) return; //throw error or something

        const recipe = event.recipe;

        create_meal({
            date: formatted_selected_date,
            meal: {
                meal_type: meal_type,
                food_item: recipe.title,
                calories: recipe.calories,
                protein: recipe.protein,
                carbohydrates: 0,
                fat: recipe.fat,
                fiber: 0,
                sugar: 0,
                sodium: recipe.sodium,
                cholesterol: 0,
                water_intake: 0,
                servings: 1,
                logged_at: new Date().toISOString(),
            }
        });
    }

    return (
        <EventsCard
            events={craving_events}
            title="Craving Events"
            description="Logged craving moments and recommended next steps."
            icon={<Zap className="size-5 text-muted-foreground" />}
            empty_label="No craving events logged yet."
            renderAccordionItem={(event, onAdd, onDelete) => (
                <EventAccordionItem
                    key={event._id}
                    id={event._id}
                    icon={<Siren className="h-4 w-4 text-muted-foreground" />}
                    event_label="Craving Event"
                    occurred_at={new Date(event.occurred_at)}
                    detail_items={[
                        { label: "Occurred At", value: new Date(event.occurred_at).toLocaleString() },
                        { label: "Craving Prompt", value: event.craving_prompt },
                    ]}
                    suggested_actions={event.suggested_actions}
                    onDelete={onDelete}
                    onAdd={onAdd}
                />
            )}
            onDelete={(date, id) => { delete_craving.mutate({ date, id }) }}
            onAdd={handleAddMeal}
        />
    );
}