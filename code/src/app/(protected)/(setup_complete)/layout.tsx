import { getCurrentSession } from "@/app/actions";
import { AppSidebar } from "@/components/dashboard/app_sidebar";
import { SiteHeader } from "@/components/dashboard/sidebar_header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { session, user } = await getCurrentSession();

    //redirect to setup if logged in but setup not complete
    if (user && !user.setup_complete) {
        return redirect("/setup");
    }

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );

}
