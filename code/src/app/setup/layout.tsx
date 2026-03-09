import { getCurrentSession } from "@/app/actions";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Setup',
};

export default async function Layout({ children }: { children: any }) {
    const { session, user } = await getCurrentSession();

    //redirect if logged in and setup complete
    if(user && user.setup_complete){
        redirect("/dashboard");
    }

    return (
        <div className="
                h-[calc(100vh-5rem)]
                flex 
                flex-col 
                justify-center">
            <div className="w-full max-w-md mx-auto px-4">
                {children}
            </div>
        </div>
    )
}
