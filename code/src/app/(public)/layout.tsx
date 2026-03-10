import Header from "@/components/header";

export default async function Layout({ children }: { children: any }) {
    return (
        <>
            <Header />
            {children}
        </>
    )
}
