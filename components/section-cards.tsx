"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-api";
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    GitBranch,
    Bot,
} from "lucide-react";

export function SectionCards() {
    const { summary, isLoading, error } = useDashboard();

    if (isLoading) {
        return (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-[80px] sm:w-[100px]" />
                            <Skeleton className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-[50px] mb-2" />
                            <Skeleton className="h-3 w-[100px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card className="border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="text-red-600 dark:text-red-400 text-sm">
                            Error Loading Data
                        </CardTitle>
                        <CardDescription>
                            Unable to connect to the backend API
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const cards = [
        {
            title: "Total Failures",
            value: summary?.total_failures || 0,
            description: "Workflow failures tracked",
            icon: AlertTriangle,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-50 dark:bg-amber-500/10",
        },
        {
            title: "Repositories",
            value: summary?.total_repositories || 0,
            description: "Active repositories monitored",
            icon: GitBranch,
            iconColor: "text-indigo-500",
            bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
        },
        {
            title: "Active Fixes",
            value: summary?.active_fixes || 0,
            description: "Pending human approval",
            icon: Clock,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-500/10",
        },
        {
            title: "Success Rate",
            value: `${(summary?.success_rate || 0).toFixed(1)}%`,
            description: "Fix approval rate",
            icon: TrendingUp,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
        },
        {
            title: "Avg Processing",
            value: summary?.processing_time_avg || "N/A",
            description: "AI analysis time",
            icon: Bot,
            iconColor: "text-violet-500",
            bgColor: "bg-violet-50 dark:bg-violet-500/10",
        },
        {
            title: "System Status",
            value: null,
            description: "All services healthy",
            icon: CheckCircle,
            iconColor: "text-emerald-500",
            bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
            badge: "Operational",
        },
    ];

    return (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {cards.map((card, index) => (
                <Card 
                    key={index} 
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
                        <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            {card.title}
                        </CardTitle>
                        <div className={`p-1.5 rounded-lg ${card.bgColor} flex-shrink-0`}>
                            <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0">
                        {card.badge ? (
                            <div className="flex items-center">
                                <Badge
                                    variant="outline"
                                    className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                >
                                    {card.badge}
                                </Badge>
                            </div>
                        ) : (
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {card.value}
                            </div>
                        )}
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                            {card.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
