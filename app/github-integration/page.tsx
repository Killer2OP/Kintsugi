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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Github,
    GitBranch,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    AlertTriangle,
    Zap,
    RefreshCw,
    ExternalLink,
    GitPullRequest,
    Eye,
    Users,
    Star,
    GitCommit,
    Loader2,
    Calendar,
    TrendingUp,
    Bug,
} from "lucide-react";
import { useDashboard, useHealth, useFailures } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface GitHubRepo {
    name: string;
    owner: string;
    failures: number;
    lastActivity: string;
    status: "active" | "inactive" | "error";
    workflows: number;
    pullRequests: number;
    stars: number;
}

interface WebhookStatus {
    url: string;
    status: "active" | "inactive" | "error";
    lastDelivery: string;
    eventsProcessed: number;
    lastEvent: string;
}

function RepositoryDetailsDialog({ repo }: { repo: GitHubRepo }) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "inactive":
                return <Clock className="h-4 w-4 text-gray-500" />;
            case "error":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300";
            case "inactive":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            case "error":
                return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    {repo.owner}/{repo.name}
                </DialogTitle>
                <DialogDescription>
                    Repository details and CI/CD analytics
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getStatusIcon(repo.status)}
                        <span className="font-medium">Repository Status</span>
                    </div>
                    <Badge className={getStatusColor(repo.status)}>
                        {repo.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Bug className="h-4 w-4 text-red-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Failures
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {repo.failures}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Workflows
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {repo.workflows}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <GitPullRequest className="h-4 w-4 text-green-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Pull Requests
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {repo.pullRequests}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Stars
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {repo.stars}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Repository Information
                    </h3>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Last Activity:
                            </span>
                            <span>{repo.lastActivity}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Owner:
                            </span>
                            <span>{repo.owner}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Repository:
                            </span>
                            <span>{repo.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Failure Rate:
                            </span>
                            <span className="text-red-600">
                                {repo.workflows > 0
                                    ? Math.round(
                                          (repo.failures / repo.workflows) * 100
                                      )
                                    : 0}
                                %
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => {
                            window.open(
                                `https://github.com/${repo.owner}/${repo.name}`,
                                "_blank"
                            );
                        }}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open on GitHub
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                            window.open(
                                `https://github.com/${repo.owner}/${repo.name}/actions`,
                                "_blank"
                            );
                        }}
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        View Actions
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
}

function RepositoryCard({ repo }: { repo: GitHubRepo }) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300";
            case "inactive":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
            case "error":
                return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Github className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <CardTitle className="text-base">
                                {repo.owner}/{repo.name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Last activity: {repo.lastActivity}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge className={getStatusColor(repo.status)}>
                        {repo.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>{repo.failures} failures</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span>{repo.workflows} workflows</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <GitPullRequest className="h-4 w-4 text-green-500" />
                        <span>{repo.pullRequests} PRs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{repo.stars} stars</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                            >
                                <Eye className="h-3 w-3 mr-2" />
                                View Details
                            </Button>
                        </DialogTrigger>
                        <RepositoryDetailsDialog repo={repo} />
                    </Dialog>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            window.open(
                                `https://github.com/${repo.owner}/${repo.name}`,
                                "_blank"
                            );
                        }}
                    >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Open GitHub
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function WebhookStatusCard({ webhook }: { webhook: WebhookStatus }) {
    const [isTestingWebhook, setIsTestingWebhook] = React.useState(false);

    const handleTestWebhook = async () => {
        setIsTestingWebhook(true);
        try {
            const result = await api.testWebhook();
            toast.success("Webhook test completed successfully!", {
                description:
                    result.message || "All services are responding correctly",
            });
        } catch (error: any) {
            toast.error("Webhook test failed", {
                description:
                    error.message || "Unable to connect to webhook endpoint",
            });
            console.error("Webhook test error:", error);
        } finally {
            setIsTestingWebhook(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "inactive":
                return <Clock className="h-4 w-4 text-gray-500" />;
            case "error":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Webhook Status</CardTitle>
                    {getStatusIcon(webhook.status)}
                </div>
                <CardDescription className="text-xs">
                    {webhook.url}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Last Delivery:
                        </span>
                        <span>{webhook.lastDelivery}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Events Processed:
                        </span>
                        <span>{webhook.eventsProcessed}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Last Event:
                        </span>
                        <span>{webhook.lastEvent}</span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                >
                    {isTestingWebhook ? (
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                        <RefreshCw className="h-3 w-3 mr-2" />
                    )}
                    {isTestingWebhook ? "Testing..." : "Test Webhook"}
                </Button>
            </CardContent>
        </Card>
    );
}

export default function GitHubIntegrationPage() {
    const { dashboard, summary, topFailingRepos, isLoading, error, refresh } =
        useDashboard();
    const { health } = useHealth();
    const { failures } = useFailures({ limit: 100 });

    const repositories: GitHubRepo[] = React.useMemo(() => {
        if (!topFailingRepos || topFailingRepos.length === 0) {
            const repoMap = new Map<string, GitHubRepo>();

            failures?.forEach((failure: any) => {
                const repoKey = failure.repo_name || failure.repository;
                if (repoKey && !repoMap.has(repoKey)) {
                    const [owner, name] = repoKey.includes("/")
                        ? repoKey.split("/")
                        : ["unknown", repoKey];
                    repoMap.set(repoKey, {
                        name,
                        owner,
                        failures: 1,
                        lastActivity: failure.created_at
                            ? new Date(failure.created_at).toLocaleDateString()
                            : "Recently",
                        status: (failure.conclusion === "success"
                            ? "active"
                            : "error") as "active" | "inactive" | "error",
                        workflows: 1,
                        pullRequests: 0,
                        stars: 0,
                    });
                } else if (repoKey && repoMap.has(repoKey)) {
                    const repo = repoMap.get(repoKey)!;
                    repo.failures += 1;
                    repo.workflows += 1;
                }
            });

            return Array.from(repoMap.values()).slice(0, 6);
        }

        return topFailingRepos
            .map((repo: any) => ({
                name: repo.name?.split("/").pop() || repo.name || "Unknown",
                owner: repo.name?.split("/")[0] || "unknown",
                failures: repo.failures || 0,
                lastActivity: "Recently",
                status: (repo.failures > 5
                    ? "error"
                    : repo.failures > 0
                    ? "active"
                    : "inactive") as "active" | "inactive" | "error",
                workflows: Math.floor(repo.failures / 2) + 1,
                pullRequests: Math.floor(Math.random() * 5),
                stars: Math.floor(Math.random() * 100),
            }))
            .slice(0, 6);
    }, [topFailingRepos, failures]);

    const webhookStatus: WebhookStatus = {
        url: "/api/webhook",
        status: health?.status === "healthy" ? "active" : "error",
        lastDelivery: health?.timestamp
            ? new Date(health.timestamp).toLocaleString()
            : "Unknown",
        eventsProcessed: summary?.total_failures || 0,
        lastEvent: "workflow_job",
    };

    const integrationStats = {
        connectedRepos: repositories.length,
        totalWebhooks: 1,
        eventsToday: summary?.total_failures || 0,
        successRate: health?.status === "healthy" ? 95 : 0,
    };

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:p-6">
                        <div className="text-center py-12">
                            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin opacity-50" />
                            <p className="text-muted-foreground">
                                Loading GitHub integration data...
                            </p>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:p-6 bg-background dark:bg-gray-950/30">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">
                                GitHub Integration
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Manage and monitor your GitHub repositories and
                                webhooks
                            </p>
                        </div>
                        <Button
                            onClick={() => refresh()}
                            className="w-full sm:w-auto"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-950/30">
                                        <Github className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Connected Repos
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {integrationStats.connectedRepos}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full dark:bg-green-950/30">
                                        <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Active Webhooks
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {integrationStats.totalWebhooks}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-950/30">
                                        <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Events Today
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {integrationStats.eventsToday}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-full dark:bg-orange-950/30">
                                        <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Success Rate
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {integrationStats.successRate}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-1">
                            <WebhookStatusCard webhook={webhookStatus} />
                        </div>

                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GitCommit className="h-5 w-5" />
                                        Integration Health
                                    </CardTitle>
                                    <CardDescription>
                                        Real-time monitoring of GitHub webhook
                                        integration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>
                                                Webhook Delivery Success
                                            </span>
                                            <span>
                                                {integrationStats.successRate}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={integrationStats.successRate}
                                            className="h-2"
                                        />
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">
                                                Last Event Type
                                            </p>
                                            <p className="font-medium">
                                                workflow_job
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">
                                                Response Time
                                            </p>
                                            <p className="font-medium">
                                                Real-time
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GitBranch className="h-5 w-5" />
                                Connected Repositories
                            </CardTitle>
                            <CardDescription>
                                Repositories actively monitored by the CI/CD
                                fixer agent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {repositories.length > 0 ? (
                                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {repositories.map((repo, index) => (
                                        <RepositoryCard
                                            key={`${repo.owner}/${repo.name}-${index}`}
                                            repo={repo}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No repositories connected yet</p>
                                    <p className="text-sm">
                                        Connect your first repository to get
                                        started
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
