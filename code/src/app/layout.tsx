import type { Metadata } from "next";
import "@/app/globals.css";
import Providers from "@/components/providers/providers";

export const metadata: Metadata = {
    title: "NutriAI",
    description: "AI-powered nutrition app that predicts appetite, energy, and weight trends while generating personalized diet plans.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}