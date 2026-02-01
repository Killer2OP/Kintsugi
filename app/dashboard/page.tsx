import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { FailuresTableEnhanced } from "@/components/failures-table-enhanced";
import { PendingFixesComponent } from "@/components/pending-fixes";
import { RealTimeAnalytics } from "@/components/real-time-analytics";
import { AIAgentStatus } from "@/components/ai-agent-status";
import { LiveWorkflowMonitor } from "@/components/live-workflow-monitor";
import { QuickActionsPanel } from "@/components/quick-actions-panel";
import { SectionCards } from "@/components/section-cards";
import { SystemStatusBanner } from "@/components/system-status-banner";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Page() {
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
                <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 dark:from-[#0a0a0f] dark:via-blue-950/10 dark:to-cyan-950/10">
                    {/* Hero Header Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                                    Command Center
                                </h1>
                                <p className="text-lg text-muted-foreground mt-1">
                                    Real-time CI/CD monitoring and control
                                </p>
                            </div>
                        </div>
                        <SystemStatusBanner />
                    </div>

                    {/* Section Cards - Metrics Overview */}
                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <SectionCards />
                    </div>

                    {/* AI Agent Status - Full Width */}
                    <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-4">
                        <AIAgentStatus />
                    </div>

                    {/* Quick Actions Panel - Full Width */}
                    <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 rounded-xl border border-purple-200/50 dark:border-purple-800/50 p-4">
                        <QuickActionsPanel />
                    </div>

                    {/* Live Workflow Monitor - Full Width */}
                    <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50 p-4">
                        <LiveWorkflowMonitor />
                    </div>

                    {/* CI/CD Failures - Full Width */}
                    <div className="bg-gradient-to-br from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10 rounded-xl border border-red-200/50 dark:border-red-800/50 p-4">
                        <FailuresTableEnhanced />
                    </div>

                    {/* Fix Management - Full Width */}
                    <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 rounded-xl border border-green-200/50 dark:border-green-800/50 p-4">
                        <PendingFixesComponent />
                    </div>

                    {/* Analytics Chart - Full Width */}
                    <div className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 p-4">
                        <ChartAreaInteractive />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
