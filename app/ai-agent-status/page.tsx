"use client";

import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    Brain,
    Cpu,
    Activity,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Zap,
    RefreshCw,
    Clock,
    TrendingUp,
    BarChart3,
    Bot,
    Database,
    Network,
    Loader2,
    Settings,
    Play,
    Pause,
} from "lucide-react";
import { useHealth, useAnalytics, useDashboard } from "@/hooks/use-api";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AgentPerformance {
    name: string;
    type: "ai_analyzer" | "orchestrator" | "database" | "api";
    status: "active" | "idle" | "error" | "maintenance";
    uptime: string;
    tasksProcessed: number;
    successRate: number;
    avgResponseTime: string;
    lastActivity: string;
    memoryUsage: number;
    cpuUsage: number;
    version: string;
    icon: React.ElementType;
    color: string;
}

interface SystemMetric {
    name: string;
    value: string | number;
    unit?: string;
    trend: "up" | "down" | "stable";
    icon: React.ElementType;
    color: string;
}

function AgentStatusCard({ agent }: { agent: AgentPerformance }) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case "idle":
                return (
                    <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Idle
                    </Badge>
                );
            case "error":
                return (
                    <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Error
                    </Badge>
                );
            case "maintenance":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300">
                        <Settings className="h-3 w-3 mr-1" />
                        Maintenance
                    </Badge>
                );
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    const Icon = agent.icon;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-full ${agent.color} text-white`}
                        >
                            <Icon className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base">
                                {agent.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {agent.type.replace("_", " ")} • v
                                {agent.version}
                            </CardDescription>
                        </div>
                    </div>
                    {getStatusBadge(agent.status)}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-muted-foreground text-xs">
                            Tasks Processed
                        </p>
                        <p className="font-medium">
                            {agent.tasksProcessed.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">
                            Avg Response
                        </p>
                        <p className="font-medium">{agent.avgResponseTime}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">Uptime</p>
                        <p className="font-medium">{agent.uptime}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-xs">
                            Last Activity
                        </p>
                        <p className="font-medium">{agent.lastActivity}</p>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                            Success Rate
                        </span>
                        <span className="font-medium">
                            {typeof agent.successRate === "number" &&
                            !isNaN(agent.successRate)
                                ? Math.min(
                                      100,
                                      Math.max(0, agent.successRate)
                                  ).toFixed(0)
                                : "0"}
                            %
                        </span>
                    </div>
                    <Progress
                        value={
                            typeof agent.successRate === "number" &&
                            !isNaN(agent.successRate)
                                ? Math.min(100, Math.max(0, agent.successRate))
                                : 0
                        }
                        className="h-2"
                    />
                </div>

                <div className="space-y-2">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                                Memory Usage
                            </span>
                            <span>{agent.memoryUsage}%</span>
                        </div>
                        <Progress value={agent.memoryUsage} className="h-1" />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">
                                CPU Usage
                            </span>
                            <span>{agent.cpuUsage}%</span>
                        </div>
                        <Progress value={agent.cpuUsage} className="h-1" />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-3 w-3 mr-2" />
                        Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Restart
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SystemMetricCard({ metric }: { metric: SystemMetric }) {
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "up":
                return <TrendingUp className="h-3 w-3 text-green-500" />;
            case "down":
                return (
                    <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                );
            default:
                return <Activity className="h-3 w-3 text-blue-500" />;
        }
    };

    const Icon = metric.icon;

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${metric.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {metric.name}
                            </p>
                            <p className="text-xl font-bold">
                                {metric.value}
                                {metric.unit && (
                                    <span className="text-sm font-normal text-muted-foreground ml-1">
                                        {metric.unit}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    {getTrendIcon(metric.trend)}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AIAgentStatusPage() {
    const {
        health,
        isLoading: healthLoading,
        error: healthError,
        refresh: refreshHealth,
    } = useHealth();
    const { analytics, isLoading: analyticsLoading } = useAnalytics();
    const { dashboard, summary } = useDashboard();

    const agents: AgentPerformance[] = React.useMemo(() => {
        const baseUptime = "99.5%";
        const baseVersion = "2.1.0";

        const analyticsData = analytics as Record<string, unknown> | undefined;
        const statsData = (
            analyticsData?.statistics as Record<string, unknown> | undefined
        )?.overall_stats as Record<string, unknown> | undefined;

        const totalFixes = Number(
            statsData?.total_fixes ||
                analyticsData?.total_fixes_generated ||
                summary?.total_fixes ||
                0
        );
        const approvedFixes = Number(
            statsData?.approved_fixes ||
                analyticsData?.total_fixes_approved ||
                summary?.approved_fixes ||
                0
        );

        let successRate = 41;
        if (totalFixes > 0 && approvedFixes >= 0) {
            const calculated = (approvedFixes / totalFixes) * 100;
            if (calculated >= 0 && calculated <= 100 && !isNaN(calculated)) {
                successRate = Math.round(calculated);
            }
        }

        return [
            {
                name: "Gemini AI Analyzer",
                type: "ai_analyzer" as const,
                status:
                    health?.services?.gemini_api === "available"
                        ? "active"
                        : "error",
                uptime: baseUptime,
                tasksProcessed: totalFixes,
                successRate: successRate,
                avgResponseTime:
                    health?.services?.gemini_api === "available"
                        ? "2.3s"
                        : "N/A",
                lastActivity: health?.timestamp
                    ? new Date(health.timestamp).toLocaleTimeString()
                    : "Unknown",
                memoryUsage:
                    health?.services?.gemini_api === "available" ? 68 : 0,
                cpuUsage: health?.services?.gemini_api === "available" ? 31 : 0,
                version: baseVersion,
                icon: Brain,
                color: "bg-blue-500",
            },
            {
                name: "Portia Orchestrator",
                type: "orchestrator" as const,
                status:
                    health?.services?.gemini_api === "available"
                        ? "active"
                        : "error",
                uptime: baseUptime,
                tasksProcessed: totalFixes,
                successRate: successRate,
                avgResponseTime:
                    health?.services?.gemini_api === "available"
                        ? "1.8s"
                        : "N/A",
                lastActivity: health?.timestamp
                    ? new Date(health.timestamp).toLocaleTimeString()
                    : "Unknown",
                memoryUsage:
                    health?.services?.gemini_api === "available" ? 44 : 0,
                cpuUsage: health?.services?.gemini_api === "available" ? 12 : 0,
                version: baseVersion,
                icon: Cpu,
                color: "bg-purple-500",
            },
            {
                name: "Database Engine",
                type: "database" as const,
                status:
                    health?.services?.database === "connected"
                        ? "active"
                        : "error",
                uptime: baseUptime,
                tasksProcessed: summary?.total_failures || 0,
                successRate: 98,
                avgResponseTime: "45ms",
                lastActivity: health?.timestamp
                    ? new Date(health.timestamp).toLocaleTimeString()
                    : "Unknown",
                memoryUsage:
                    health?.services?.database === "connected" ? 39 : 0,
                cpuUsage: health?.services?.database === "connected" ? 6 : 0,
                version: "PostgreSQL 15",
                icon: Database,
                color: "bg-green-500",
            },
            {
                name: "API Gateway",
                type: "api" as const,
                status: health?.status === "healthy" ? "active" : "error",
                uptime: baseUptime,
                tasksProcessed: (summary?.total_failures || 0) * 2,
                successRate: 99,
                avgResponseTime: "120ms",
                lastActivity: health?.timestamp
                    ? new Date(health.timestamp).toLocaleTimeString()
                    : "Unknown",
                memoryUsage: health?.status === "healthy" ? 20 : 0,
                cpuUsage: health?.status === "healthy" ? 6 : 0,
                version: "FastAPI 0.104",
                icon: Network,
                color: "bg-orange-500",
            },
        ];
    }, [health, analytics, summary]);

    const systemMetrics: SystemMetric[] = [
        {
            name: "Total Processed",
            value: summary?.total_failures || 0,
            trend: "up",
            icon: BarChart3,
            color: "bg-blue-500",
        },
        {
            name: "Success Rate",
            value:
                agents.length > 0
                    ? Math.min(
                          100,
                          Math.max(
                              0,
                              Math.round(
                                  agents.reduce(
                                      (acc, agent) =>
                                          acc +
                                          (typeof agent.successRate ===
                                              "number" &&
                                          !isNaN(agent.successRate)
                                              ? agent.successRate
                                              : 0),
                                      0
                                  ) / agents.length
                              )
                          )
                      )
                    : 0,
            unit: "%",
            trend: "up",
            icon: CheckCircle2,
            color: "bg-green-500",
        },
        {
            name: "Avg Response Time",
            value: "1.8",
            unit: "s",
            trend: "down",
            icon: Clock,
            color: "bg-purple-500",
        },
        {
            name: "Active Agents",
            value: agents.filter((a) => a.status === "active").length,
            trend: "stable",
            icon: Bot,
            color: "bg-orange-500",
        },
    ];

    const isLoading = healthLoading || analyticsLoading;

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:p-6">
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin opacity-50" />
                            <p className="text-muted-foreground">
                                Loading AI agent status...
                            </p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    const systemHealth = health?.status === "healthy" && !healthError;

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:p-6 bg-background dark:bg-gray-950/30">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">
                                AI Agent Status
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Real-time monitoring and management of CI/CD
                                fixing agents
                            </p>
                        </div>
                        <Button
                            onClick={() => refreshHealth()}
                            className="w-full sm:w-auto"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-4">
                            <div
                                className={`flex items-center gap-3 p-4 rounded-lg ${
                                    systemHealth
                                        ? "bg-green-50 border border-green-200 dark:bg-green-950/30"
                                        : "bg-red-50 border border-red-200 dark:bg-red-950/30"
                                }`}
                            >
                                {systemHealth ? (
                                    <>
                                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                        <div>
                                            <h3 className="font-semibold text-green-800 dark:text-green-200">
                                                System Operational
                                            </h3>
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                All AI agents are running
                                                optimally
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                        <div>
                                            <h3 className="font-semibold text-red-800 dark:text-red-200">
                                                System Issues Detected
                                            </h3>
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                Some agents are experiencing
                                                problems
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {systemMetrics.map((metric, index) => (
                            <SystemMetricCard key={index} metric={metric} />
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                AI Agent Performance
                            </CardTitle>
                            <CardDescription>
                                Detailed status and performance metrics for each
                                agent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                                {agents.map((agent, index) => (
                                    <AgentStatusCard
                                        key={index}
                                        agent={agent}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                System Controls
                            </CardTitle>
                            <CardDescription>
                                Administrative actions and system-wide controls
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
                                <Button
                                    variant="outline"
                                    className="h-auto p-4 justify-start"
                                >
                                    <div className="flex items-center gap-3">
                                        <Play className="h-5 w-5 text-green-500" />
                                        <div className="text-left">
                                            <p className="font-medium">
                                                Start All Agents
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Activate all AI processing
                                                agents
                                            </p>
                                        </div>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-auto p-4 justify-start"
                                >
                                    <div className="flex items-center gap-3">
                                        <Pause className="h-5 w-5 text-yellow-500" />
                                        <div className="text-left">
                                            <p className="font-medium">
                                                Pause System
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Temporarily halt all processing
                                            </p>
                                        </div>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="h-auto p-4 justify-start"
                                >
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="h-5 w-5 text-blue-500" />
                                        <div className="text-left">
                                            <p className="font-medium">
                                                Restart System
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Full system restart and refresh
                                            </p>
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
