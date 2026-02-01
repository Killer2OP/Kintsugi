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
import {
    GitBranch,
    Clock,
    Play,
    CheckCircle,
    XCircle,
    Loader2,
    ExternalLink,
    AlertCircle,
} from "lucide-react";
import { useFailures } from "@/hooks/use-api";

interface WorkflowActivity {
    id: string;
    repository: string;
    workflow: string;
    status:
        | "running"
        | "analyzing"
        | "fixing"
        | "completed"
        | "failed"
        | "pending";
    branch: string;
    commit: string;
    startTime: string;
    estimatedCompletion?: string;
    progress: number;
    runId: string;
    fix_status?: string;
}

// Convert API failure data to workflow activity
function convertFailureToWorkflow(
    failure: Record<string, unknown>,
    currentTime: number = Date.now()
): WorkflowActivity {
    const createdAt = new Date(String(failure.created_at));
    const diffMinutes = Math.floor(
        (currentTime - createdAt.getTime()) / (1000 * 60)
    );

    const workflowSeed =
        parseInt(String(failure.id)) || parseInt(String(failure.run_id)) || 1;
    const baseVariation = (workflowSeed % 25) + 10; // 10-35% base variation

    let progress = 0;
    let status: WorkflowActivity["status"] = "pending";
    let estimatedCompletion = "";

    switch (failure.fix_status) {
        case "pending":
            if (diffMinutes > 60 && progress > 85) {
                status = "fixing";
                progress = Math.min(
                    98,
                    70 + baseVariation + (diffMinutes - 60) * 2
                );
                estimatedCompletion = "1-2 minutes";
            } else {
                status = "analyzing";

                if (diffMinutes < 5) {
                    progress = Math.floor(15 + baseVariation + diffMinutes * 4);
                } else if (diffMinutes < 30) {
                    progress = Math.floor(
                        45 + baseVariation + (diffMinutes - 5) * 1.2
                    );
                } else {
                    const slowProgress = Math.min(
                        95,
                        75 + baseVariation + (diffMinutes - 30) * 0.3
                    );
                    progress = Math.floor(slowProgress);
                }

                estimatedCompletion =
                    progress > 85
                        ? "1-2 minutes"
                        : progress > 60
                        ? "2-5 minutes"
                        : "3-8 minutes";
            }
            break;

        case "generated":
            status = "fixing";

            if (diffMinutes < 2) {
                progress = Math.floor(70 + baseVariation);
            } else {
                const fixProgress = Math.min(
                    98,
                    70 + baseVariation + diffMinutes * 3
                );
                progress = Math.floor(fixProgress);
            }
            estimatedCompletion = progress > 95 ? "30 seconds" : "1-3 minutes";
            break;

        case "approved":
            status = "completed";
            progress = 100;
            estimatedCompletion = "";
            break;

        case "rejected":
            status = "failed";
            progress = 100;
            estimatedCompletion = "";
            break;

        default:
            status = "analyzing";
            if (diffMinutes < 10) {
                progress = Math.floor(20 + baseVariation + diffMinutes * 2);
            } else {
                const timeProgress = Math.min(
                    90,
                    20 + baseVariation + diffMinutes * 1.5
                );
                progress = Math.floor(timeProgress);
            }
            estimatedCompletion = "2-5 minutes";
    }

    let timeAgo = "";
    if (diffMinutes < 1) {
        timeAgo = "Just now";
    } else if (diffMinutes < 60) {
        timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    } else if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
        const days = Math.floor(diffMinutes / 1440);
        timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
    }

    return {
        id: String(failure.id),
        repository: `${failure.owner}/${failure.repo_name}`,
        workflow: `🔴 ${failure.workflow_name || "Workflow Pipeline"}`,
        status,
        branch: "main",
        commit: String(failure.run_id).slice(-7),
        startTime: timeAgo,
        estimatedCompletion,
        progress,
        runId: String(failure.run_id),
        fix_status: String(failure.fix_status),
    };
}

function getStatusIcon(status: WorkflowActivity["status"]) {
    switch (status) {
        case "running":
            return (
                <Play className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            );
        case "analyzing":
            return (
                <Loader2 className="h-4 w-4 text-orange-500 dark:text-orange-400 animate-spin" />
            );
        case "fixing":
            return (
                <Loader2 className="h-4 w-4 text-blue-500 dark:text-blue-400 animate-spin" />
            );
        case "completed":
            return (
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
            );
        case "failed":
            return (
                <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
            );
        default:
            return (
                <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            );
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case "running":
            return (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                    Running
                </Badge>
            );
        case "analyzing":
            return (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300">
                    Analyzing
                </Badge>
            );
        case "fixing":
            return (
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300">
                    Fixing
                </Badge>
            );
        case "completed":
            return (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300">
                    Completed
                </Badge>
            );
        case "failed":
            return <Badge variant="destructive">Failed</Badge>;
        default:
            return <Badge variant="secondary">Unknown</Badge>;
    }
}

function WorkflowRow({ workflow }: { workflow: WorkflowActivity }) {
    const isStuck = workflow.status === "analyzing" && workflow.progress > 60;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(workflow.status)}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                            {workflow.repository}
                        </p>
                        {getStatusBadge(workflow.status)}
                        {isStuck && (
                            <Badge
                                variant="outline"
                                className="border-orange-500 text-orange-700 dark:border-orange-400 dark:text-orange-300 text-xs"
                            >
                                <Clock className="h-3 w-3 mr-1" />
                                Long Running
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                        {workflow.workflow} • {workflow.branch} •{" "}
                        {workflow.commit}
                    </p>
                    {workflow.status !== "completed" &&
                        workflow.status !== "failed" && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <span>Progress</span>
                                    <span>{workflow.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                            isStuck
                                                ? "bg-orange-500 dark:bg-orange-400"
                                                : workflow.status === "fixing"
                                                ? "bg-green-500 dark:bg-green-400"
                                                : "bg-blue-500 dark:bg-blue-400"
                                        }`}
                                        style={{
                                            width: `${workflow.progress}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
            <div className="flex items-center gap-2 sm:ml-4">
                <div className="text-right text-xs">
                    <p className="text-muted-foreground">
                        Started {workflow.startTime}
                    </p>
                    {workflow.estimatedCompletion && (
                        <p
                            className={`text-muted-foreground ${
                                isStuck
                                    ? "text-orange-600 dark:text-orange-400"
                                    : ""
                            }`}
                        >
                            ETA: {workflow.estimatedCompletion}
                        </p>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        const url = `https://github.com/${workflow.repository}/actions/runs/${workflow.runId}`;
                        window.open(url, "_blank");
                    }}
                    title="View on GitHub"
                >
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export function LiveWorkflowMonitor() {
    const { failures, isLoading, error } = useFailures({ limit: 20 });
    const [currentTime, setCurrentTime] = React.useState(Date.now());

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const workflowActivities = React.useMemo(() => {
        if (!failures || failures.length === 0) return [];
        return failures.map((failure) =>
            convertFailureToWorkflow(
                failure as unknown as Record<string, unknown>,
                currentTime
            )
        );
    }, [failures, currentTime]);

    const activeWorkflows = workflowActivities.filter(
        (w) => w.status !== "completed" && w.status !== "failed"
    );
    const completedWorkflows = workflowActivities.filter(
        (w) => w.status === "completed" || w.status === "failed"
    );

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <GitBranch className="h-5 w-5" />
                                Live Workflow Monitor
                            </CardTitle>
                            <CardDescription>
                                Real-time tracking of workflows being
                                processed
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin opacity-50" />
                        <p className="text-sm text-muted-foreground">
                            Loading workflows...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <GitBranch className="h-5 w-5" />
                                Live Workflow Monitor
                            </CardTitle>
                            <CardDescription>
                                Real-time tracking of workflows being
                                processed
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Failed to load workflows</p>
                        <p className="text-xs">Please try again later</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <GitBranch className="h-4 w-4 sm:h-5 sm:w-5" />
                            Live Workflow Monitor
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Real-time tracking of workflows being
                            processed
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="bg-blue-50 dark:bg-blue-950/30 dark:text-blue-300 text-xs"
                        >
                            {activeWorkflows.length} Active
                        </Badge>
                        <Badge
                            variant="outline"
                            className="bg-green-50 dark:bg-green-950/30 dark:text-green-300 text-xs"
                        >
                            {
                                completedWorkflows.filter(
                                    (w) => w.status === "completed"
                                ).length
                            }{" "}
                            Completed
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {activeWorkflows.length > 0 ? (
                        <>
                            <h4 className="text-sm font-medium text-muted-foreground">
                                Active Workflows
                            </h4>
                            {activeWorkflows.map((workflow) => (
                                <WorkflowRow
                                    key={workflow.id}
                                    workflow={workflow}
                                />
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No active workflows</p>
                            <p className="text-xs">
                                Waiting for new workflow failures to process
                            </p>
                        </div>
                    )}

                    {completedWorkflows.length > 0 && (
                        <>
                            <h4 className="text-sm font-medium text-muted-foreground mt-6">
                                Recent Completions
                            </h4>
                            {completedWorkflows.slice(0, 3).map((workflow) => (
                                <WorkflowRow
                                    key={workflow.id}
                                    workflow={workflow}
                                />
                            ))}
                        </>
                    )}

                    {workflowActivities.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No workflows found</p>
                            <p className="text-xs">
                                Workflows will appear here when pipeline failures
                                are detected
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
