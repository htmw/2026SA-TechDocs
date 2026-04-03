import { getCurrentSession } from "@/app/actions";
import DashboardClient from "./dashboard-client";
import { getUserTrends } from "@/services/trend-service";

export default async function DashboardPage() {
    const { user } = await getCurrentSession();
    const userId = user?._id?.toString();
    const trends = await getUserTrends(userId || "");
    return <DashboardClient trends={trends} />;
}