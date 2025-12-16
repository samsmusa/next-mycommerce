import React from 'react';
import "../css/dashboard.css"
import {AppSidebar} from "@/app/admin/components/Appsidebar";
import {cookies} from "next/headers"
import {SidebarProvider} from "@/components/ui/sidebar";
import Header from "@/app/admin/products/components/header";

export default async function Layout({children}: { children: React.ReactNode }) {

    const cookieStore = await cookies()
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
    return (
        <html>
        <body>
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar/>
            <main className="w-full flex flex-col min-h-screen overflow-hidden">
                <Header/>
                {children}
            </main>
        </SidebarProvider>
        </body>
        </html>
    );
};
