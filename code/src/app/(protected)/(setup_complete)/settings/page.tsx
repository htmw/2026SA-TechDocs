import NotificationSettings from "@/components/notifications/notification_settings";

export default function SettingsPage() {
    return (
        <main className="min-h-screen p-6">
            <div className="mx-auto w-full max-w-4xl">
                <NotificationSettings />
            </div>
        </main>
    );
}