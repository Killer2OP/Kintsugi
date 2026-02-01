"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MLPredictionPanel } from "@/components/ml-prediction-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatterns, useEffectiveness, useDashboard } from "@/hooks/use-api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  Target,
  Award,
  Brain,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";

const COLORS = [
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#d8b4fe",
  "#e879f9",
  "#f0abfc",
];

export default function AnalyticsPageEnhanced() {
  const {
    patterns,
    recommendations,
    isLoading: patternsLoading,
    error: patternsError,
    refresh: refreshPatterns,
  } = usePatterns({ daysBack: 30 });

  const {
    metrics,
    isLoading: effectivenessLoading,
    error: effectivenessError,
    refresh: refreshEffectiveness,
  } = useEffectiveness();

  const {
    summary,
    isLoading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
  } = useDashboard();

  const repoFailuresData = patterns?.most_failing_repos
    ? Object.entries(patterns.most_failing_repos)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([name, failures]) => ({
          name: name.length > 20 ? name.substring(0, 20) + "..." : name,
          failures,
          fullName: name,
        }))
    : [];

  const errorTypesData = patterns?.common_error_types
    ? Object.entries(patterns.common_error_types)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .map(([name, value], index) => ({
          name: name.length > 15 ? name.substring(0, 15) + "..." : name,
          value,
          color: COLORS[index % COLORS.length],
          fullName: name,
        }))
    : [];

  const languageData = patterns?.language_distribution
    ? Object.entries(patterns.language_distribution).map(
        ([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length],
        }),
      )
    : [];

  const metricsData = metrics as Record<string, unknown> | undefined;
  const statsData = (
    metricsData?.statistics as Record<string, unknown> | undefined
  )?.overall_stats as Record<string, unknown> | undefined;

  const totalFixes = Number(
    statsData?.total_fixes || metricsData?.total_fixes_generated || 0,
  );
  const approvedFixes = Number(
    statsData?.approved_fixes || metricsData?.total_fixes_approved || 0,
  );
  const pendingFixes = Number(
    statsData?.pending_fixes || metricsData?.pending_fixes || 0,
  );
  const approvalRate = Number(
    statsData?.approval_rate || metricsData?.overall_approval_rate || 0,
  );

  const trendData = React.useMemo(() => {
    const currentWeek = {
      date: "Current Period",
      failures: summary?.total_failures || 0,
      fixes: totalFixes,
      approvals: approvedFixes,
    };

    return [currentWeek];
  }, [summary?.total_failures, totalFixes, approvedFixes]);

  const isLoading = patternsLoading || effectivenessLoading || dashboardLoading;
  const hasError = patternsError || effectivenessError || dashboardError;

  const refreshAll = () => {
    refreshPatterns();
    refreshEffectiveness();
    refreshDashboard();
  };

  if (isLoading) {
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
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-[100px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[60px]" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-[200px]" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (hasError) {
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
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Error Loading Analytics
                </CardTitle>
                <CardDescription>
                  Unable to load analytics data from the backend API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={refreshAll} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
        <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/20 dark:from-[#0f0a14] dark:via-purple-950/20 dark:to-fuchsia-950/10">
          {/* Clean Typography Header */}
          <div className="flex items-start justify-between border-l-4 border-violet-500 pl-6 py-2">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                Data Insights
              </h1>
              <p className="text-base text-muted-foreground">
                Deep analytics and pattern recognition
              </p>
            </div>
            <Button onClick={refreshAll} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Compact Metrics Row */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-violet-500 bg-gradient-to-br from-violet-50/50 to-white dark:from-violet-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Fixes
                  </CardTitle>
                  <Target className="h-4 w-4 text-violet-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">{totalFixes}</div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Approval Rate
                  </CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">
                    {Math.round(approvalRate * 100)}%
                  </div>
                  {approvalRate > 0.5 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-fuchsia-500 bg-gradient-to-br from-fuchsia-50/50 to-white dark:from-fuchsia-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Repositories
                  </CardTitle>
                  <GitBranch className="h-4 w-4 text-fuchsia-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summary?.total_repositories ||
                    Object.keys(patterns?.most_failing_repos || {}).length ||
                    0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-pink-500 bg-gradient-to-br from-pink-50/50 to-white dark:from-pink-950/20 dark:to-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    AI Learning
                  </CardTitle>
                  <Sparkles className="h-4 w-4 text-pink-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {String(
                    (metricsData?.trends as Record<string, unknown>)
                      ?.learning_velocity,
                  ) || "Active"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabbed Analytics Views */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-violet-200/50 dark:border-violet-800/50">
              <TabsTrigger value="overview" className="gap-2">
                <Activity className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="patterns" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Patterns
              </TabsTrigger>
              <TabsTrigger value="effectiveness" className="gap-2">
                <Target className="h-4 w-4" />
                Effectiveness
              </TabsTrigger>
              <TabsTrigger value="ml" className="gap-2">
                <Brain className="h-4 w-4" />
                ML Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Asymmetric Grid - Featured Chart */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Large Featured Chart - 2/3 Width */}
                <Card className="xl:col-span-2 border-violet-200/50 dark:border-violet-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Activity className="h-5 w-5  text-violet-500" />
                      Failure & Fix Trends
                    </CardTitle>
                    <CardDescription>Performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient
                            id="colorFailures"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorFixes"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorApprovals"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="failures"
                          stroke="#ef4444"
                          fillOpacity={1}
                          fill="url(#colorFailures)"
                          name="Failures"
                        />
                        <Area
                          type="monotone"
                          dataKey="fixes"
                          stroke="#8b5cf6"
                          fillOpacity={1}
                          fill="url(#colorFixes)"
                          name="Fixes"
                        />
                        <Area
                          type="monotone"
                          dataKey="approvals"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorApprovals)"
                          name="Approvals"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Side Panel - Error Distribution */}
                <Card className="border-purple-200/50 dark:border-purple-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-purple-500" />
                      Error Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {errorTypesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={errorTypesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ percent }) =>
                              `${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {errorTypesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                        <p>No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-violet-200/50 dark:border-violet-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-violet-500" />
                      Most Failing Repositories
                    </CardTitle>
                    <CardDescription>
                      Top 10 repositories by failure count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {repoFailuresData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={repoFailuresData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="failures"
                            fill="#8b5cf6"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <p>No failure data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-fuchsia-200/50 dark:border-fuchsia-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-fuchsia-500" />
                      Language Distribution
                    </CardTitle>
                    <CardDescription>
                      Programming languages analyzed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {languageData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={languageData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            fill="#d946ef"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <p>No language data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="effectiveness" className="space-y-6">
              <Card className="border-purple-200/50 dark:border-purple-800/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Fix Effectiveness Breakdown
                  </CardTitle>
                  <CardDescription>
                    Detailed analysis of fix generation and approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3 mb-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {totalFixes}
                      </div>
                      <p className="text-sm font-medium text-blue-900/70 dark:text-blue-100/70 mt-2">
                        Total Generated
                      </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                      <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                        {approvedFixes}
                      </div>
                      <p className="text-sm font-medium text-green-900/70 dark:text-green-100/70 mt-2">
                        Approved
                      </p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                      <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                        {pendingFixes}
                      </div>
                      <p className="text-sm font-medium text-orange-900/70 dark:text-orange-100/70 mt-2">
                        Pending Review
                      </p>
                    </div>
                  </div>

                  {Boolean(metricsData?.effectiveness_by_type &&
                    typeof metricsData.effectiveness_by_type === "object") && (
                      <div>
                        <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-violet-500" />
                          Effectiveness by Error Type
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(
                            metricsData.effectiveness_by_type as Record<
                              string,
                              unknown
                            >,
                          ).map(([type, data]: [string, unknown]) => {
                            const dataObj = data as Record<string, unknown>;
                            const rate = Number(dataObj.approval_rate) * 100;
                            return (
                              <div
                                key={type}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-950/20 rounded-lg border-l-4 border-violet-400"
                              >
                                <span className="font-medium">{type}</span>
                                <div className="flex items-center gap-3">
                                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                                      style={{ width: `${rate}%` }}
                                    />
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="font-mono"
                                  >
                                    {Math.round(rate)}%
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ml" className="space-y-6">
              {recommendations && recommendations.length > 0 && (
                <Card className="border-pink-200/50 dark:border-pink-800/50 bg-gradient-to-br from-pink-50/30 to-fuchsia-50/20 dark:from-pink-950/20 dark:to-fuchsia-950/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-pink-500" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription>
                      Intelligent insights based on failure patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-lg border-l-4 border-violet-400"
                        >
                          <CheckCircle className="h-5 w-5 text-violet-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm font-medium">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <MLPredictionPanel />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
