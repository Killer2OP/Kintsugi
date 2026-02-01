import { AppSidebar } from "@/components/app-sidebar";
import { FailuresTableEnhanced } from "@/components/failures-table-enhanced";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function FailuresPage() {
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
                <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:p-6">
                    <FailuresTableEnhanced />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
