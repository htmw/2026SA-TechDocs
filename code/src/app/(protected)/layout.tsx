import { getCurrentSession } from "@/app/actions";
import ClientRedirectWrapper from "@/components/client_redirector";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { session, user } = await getCurrentSession();
    // If not logged in, render client wrapper that will handle redirect
    if (!session) {
        return <ClientRedirectWrapper />;
    }

    return <>{children}</>;
}
