import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type SetupCardProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    backButton?: React.ReactNode;
};

export default function SetupCard({
    title,
    description,
    children,
    footer,
    backButton,
}: SetupCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-3">
                {backButton}

                <div className="flex flex-col">
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
            </CardHeader>

            <CardContent>{children}</CardContent>

            {footer ? <CardFooter>{footer}</CardFooter> : null}
        </Card>
    );
}