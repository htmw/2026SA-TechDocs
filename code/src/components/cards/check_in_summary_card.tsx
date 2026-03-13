import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type DailyCheckInSummaryCardProps = {
    morning_weight: number;
    energy_rating: string;
    sleep_hours: number;
    stress_level: string;
};

function SummaryRow({
    label,
    value
}: {
    label: string;
    value?: string | number;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}

export function DailyCheckInSummaryCard({ check_in_opts }: { check_in_opts?: DailyCheckInSummaryCardProps }) {
    return (
        <Card className="w-full">
            <CardHeader>
                <div>
                    <CardTitle className="text-xl">Check In Summary</CardTitle>
                    <CardDescription>
                        A quick overview of your morning wellness check-in.
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-1">
                {check_in_opts ? (
                    <>
                        <SummaryRow label="Morning Weight" value={`${check_in_opts?.morning_weight} lbs`} />
                        <Separator />
                        <SummaryRow label="Energy Rating" value={check_in_opts?.energy_rating} />
                        <Separator />
                        <SummaryRow label="Sleep Hours" value={`${check_in_opts?.sleep_hours} hrs`} />
                        <Separator />
                        <SummaryRow label="Stress Level" value={check_in_opts?.stress_level} />
                    </>
                ) : (
                    <Card className="border border-dashed shadow-none">
                        <CardContent className="flex min-h-[120px] items-center justify-center p-6">
                            <p className="text-sm text-muted-foreground">No check-in data available for this day.</p>
                        </CardContent>
                    </Card>
                )}
            </CardContent>
        </Card>
    );
}