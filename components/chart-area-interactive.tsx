"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboard } from "@/hooks/use-api";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";

export const description = "CI/CD Analytics Chart";

const chartConfig = {
    failures: {
        label: "Failures",
        color: "hsl(var(--chart-1))",
    },
    fixes: {
        label: "Fixes Generated",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
    const { dashboard, isLoading, error } = useDashboard();
    const isMobile = useIsMobile();
    const [timeRange, setTimeRange] = React.useState("30d");

    // Generate chart data from real API data
    const chartData = React.useMemo(() => {
        if (!dashboard?.summary) return [];

        // For now, create a simple time series based on available data
        // In a full implementation, you'd fetch historical data from a dedicated endpoint
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const data = [];

        // Get the current data point (today)
        const today = new Date().toISOString().split("T")[0];
        const currentFailures = dashboard.summary.total_failures || 0;
        const currentFixes = dashboard.summary.total_fixes || 0;

        // Create data points - only today has real data, rest are zeros for now
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];

            data.push({
                date: dateStr,
                failures: dateStr === today ? currentFailures : 0,
                fixes: dateStr === today ? currentFixes : 0,
            });
        }

        return data;
    }, [timeRange, dashboard]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-destructive">
                        Analytics Unavailable
                    </CardTitle>
                    <CardDescription>
                        Unable to load analytics data from the backend API
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 space-y-0 border-b py-4 sm:flex-row sm:items-center sm:gap-2 sm:py-5">
                <div className="grid flex-1 gap-1 text-center sm:text-left">
                    <CardTitle className="text-lg sm:text-xl">
                        CI/CD Failure Analytics
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Tracking workflow failures and AI-generated fixes over
                        time
                    </CardDescription>
                </div>
                <div className="flex justify-center sm:justify-end">
                    {isMobile ? (
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger
                                className="w-full max-w-[160px] rounded-lg"
                                aria-label="Select time range"
                            >
                                <SelectValue placeholder="Last 30 days" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="7d" className="rounded-lg">
                                    Last 7 days
                                </SelectItem>
                                <SelectItem value="30d" className="rounded-lg">
                                    Last 30 days
                                </SelectItem>
                                <SelectItem value="90d" className="rounded-lg">
                                    Last 90 days
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <ToggleGroup
                            type="single"
                            value={timeRange}
                            onValueChange={(value) => setTimeRange(value)}
                            className="ml-auto"
                        >
                            <ToggleGroupItem value="7d" className="text-xs">
                                7d
                            </ToggleGroupItem>
                            <ToggleGroupItem value="30d" className="text-xs">
                                30d
                            </ToggleGroupItem>
                            <ToggleGroupItem value="90d" className="text-xs">
                                90d
                            </ToggleGroupItem>
                        </ToggleGroup>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient
                                id="fillFailures"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-failures)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-failures)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                            <linearGradient
                                id="fillFixes"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-fixes)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-fixes)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(
                                            value
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        });
                                    }}
                                    indicator="dot"
                                />
                            }
                        />
                        <Area
                            dataKey="fixes"
                            type="natural"
                            fill="url(#fillFixes)"
                            stroke="var(--color-fixes)"
                            stackId="a"
                        />
                        <Area
                            dataKey="failures"
                            type="natural"
                            fill="url(#fillFailures)"
                            stroke="var(--color-failures)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
