import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/dist/client/link"

export const metadata = {
    title: "Signup",
};

export default function Signup() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Signup</CardTitle>
                <CardDescription>
                    Make an account today to start using NutriAI
                </CardDescription>
                <CardAction>
                    <Button asChild variant="link">
                        <Link href="/auth/login">
                            Login
                        </Link>
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@nutriai.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                            </div>
                            <Input id="password" type="password" required />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="confirm-password">Confirm Password</Label>
                            </div>
                            <Input id="confirm-password" type="password" required />
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                    Signup
                </Button>
            </CardFooter>
        </Card>
    )
}
