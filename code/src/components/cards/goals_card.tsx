import { Card } from "../ui/card";

interface UserGoals {
    calorieIntake: number;
    proteinIntake: number;
    carbohydrateIntake: number;
    fatIntake: number;
}

export function GoalsCard({ goals, goal }: { goals: UserGoals; goal: string }) {
    const macros = [
        { label: "Protein", grams: goals.proteinIntake, kcal: goals.proteinIntake * 4 },
        { label: "Carbs", grams: goals.carbohydrateIntake, kcal: goals.carbohydrateIntake * 4 },
        { label: "Fat", grams: goals.fatIntake, kcal: goals.fatIntake * 9 },
    ];

    return (
        <div className="space-y-3 mx-auto">
            <Card className="p-5">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">Your New Targets</p>
                    <p className="text-sm text-muted-foreground capitalize">{goal} weight</p>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-medium">{goals.calorieIntake.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">kcal / day</span>
                </div>
            </Card>

            <div className="grid grid-cols-3 gap-2.5">
                {macros.map(({ label, grams, kcal }) => (
                    <Card key={label} className="p-4">
                        <p className="text-xs text-muted-foreground mb-2.5">{label}</p>
                        <p className="text-2xl font-medium">{grams}g</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{kcal} kcal</p>
                    </Card>
                ))}
            </div>
        </div>
    );
}