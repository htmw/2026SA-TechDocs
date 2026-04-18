import { getCurrentSession } from "@/app/actions";
import DashboardClient from "./dashboard-client";
import { getUserTrends } from "@/services/trend-service";

export default async function DashboardPage() {
    // gets the current signed-in user
    const { user } = await getCurrentSession();

    // gets the user id as text for the trends request
    const userId = user?._id?.toString();

    // loads trend data for the dashboard
    const trends = await getUserTrends(userId || "");

    // sends the trend data to the dashboard screen
    return <DashboardClient trends={trends} />;
}