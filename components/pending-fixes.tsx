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
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    GitPullRequest,
    AlertTriangle,
    User,
    Calendar,
    PlayCircle,
} from "lucide-react";
import { useFixes } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { formatTimeAgo } from "@/lib/utils";
import { toast } from "sonner";

export function PendingFixesComponent() {
    const { fixes, isLoading, error, refresh } = useFixes();
    const [actionLoading, setActionLoading] = React.useState<string | null>(
        null
    );
    const [comment, setComment] = React.useState("");
    const [dialogOpen, setDialogOpen] = React.useState(false);

    const displayFixes = fixes || [];

    const handleApprove = async (fixId: string, comment?: string) => {
        try {
            setActionLoading(fixId);
            await api.approveFix(fixId, comment);
            toast.success("Fix approved successfully!");
            refresh();
        } catch (error) {
            toast.error("Failed to approve fix");
            console.error(error);
        } finally {
            setActionLoading(null);
            setComment("");
            setDialogOpen(false);
        }
    };

    const handleReject = async (fixId: string, comment?: string) => {
        try {
            setActionLoading(fixId);
            await api.rejectFix(fixId, comment);
            toast.success("Fix rejected successfully!");
            refresh();
        } catch (error) {
            toast.error("Failed to reject fix");
            console.error(error);
        } finally {
            setActionLoading(null);
            setComment("");
            setDialogOpen(false);
        }
    };

    const handleApplyFix = async (fixId: string) => {
        try {
            setActionLoading(fixId);
            await api.applyFix(fixId);
            toast.success("Fix applied successfully!");
            refresh();
        } catch (error) {
            toast.error("Failed to apply fix");
            console.error(error);
        } finally {
            setActionLoading(null);
        }
    };

    const getFixStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return (
                    <Badge
                        variant="outline"
                        className="border-yellow-500 text-yellow-700 dark:border-yellow-400 dark:text-yellow-300"
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Review
                    </Badge>
                );
            case "approved":
                return (
                    <Badge
                        variant="outline"
                        className="border-green-500 text-green-700 dark:border-green-400 dark:text-green-300"
                    >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                    </Badge>
                );
            case "applied":
                return (
                    <Badge
                        variant="outline"
                        className="border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-300"
                    >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Applied
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge
                        variant="outline"
                        className="border-red-500 text-red-700 dark:border-red-400 dark:text-red-300"
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Unknown
                    </Badge>
                );
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GitPullRequest className="h-5 w-5" />
                        Fix Management
                    </CardTitle>
                    <CardDescription>
                        AI-generated fixes with approval and application
                        workflow
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        Loading pending fixes...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GitPullRequest className="h-5 w-5" />
                        Fix Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-destructive py-8">
                        Error loading fixes: {error.message}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitPullRequest className="h-5 w-5" />
                    Fix Management ({displayFixes.length})
                </CardTitle>
                <CardDescription>
                    AI-generated fixes with approval and application workflow
                    {fixes.length === 0 && displayFixes.length > 0 && (
                        <span className="text-xs text-blue-600 block mt-1">
                            (Showing demo data - no real pending fixes)
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {displayFixes.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 dark:text-green-400" />
                        <p>No pending fixes at the moment!</p>
                        <p className="text-sm">All fixes have been reviewed.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayFixes.map((fix) => (
                            <Card
                                key={fix.id}
                                className="border-l-4 border-l-blue-500 dark:border-l-blue-400"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium">
                                                    {fix.repository ||
                                                        `${fix.owner}/${fix.repo_name}`}
                                                </h4>
                                                {getFixStatusBadge(fix.status)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {fix.owner || "Unknown"}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatTimeAgo(
                                                        fix.created_at
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                const repoPath =
                                                    fix.repository ||
                                                    `${fix.owner}/${fix.repo_name}`;
                                                const runId = fix.run_id;
                                                if (runId) {
                                                    window.open(
                                                        `https://github.com/${repoPath}/actions/runs/${runId}`,
                                                        "_blank"
                                                    );
                                                }
                                            }}
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Error Analysis
                                            </Label>
                                            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                                {fix.error_analysis ||
                                                    "Analysis not available"}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium">
                                                Suggested Fix
                                            </Label>
                                            <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
                                                <code>
                                                    {fix.suggested_fix ||
                                                        "No fix suggestion available"}
                                                </code>
                                            </pre>
                                        </div>

                                        {fix.confidence_score && (
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm font-medium">
                                                    Confidence:
                                                </Label>
                                                <Badge variant="outline">
                                                    {(
                                                        fix.confidence_score *
                                                        100
                                                    ).toFixed(1)}
                                                    %
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {fix.status === "pending" && (
                                        <div className="flex gap-2">
                                            <Dialog
                                                open={dialogOpen}
                                                onOpenChange={setDialogOpen}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        disabled={
                                                            actionLoading ===
                                                            fix.id
                                                        }
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>
                                                            Approve Fix
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Add optional
                                                            comments about this
                                                            approval.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="comment">
                                                            Comments (Optional)
                                                        </Label>
                                                        <Textarea
                                                            id="comment"
                                                            placeholder="Add any comments about this approval..."
                                                            value={comment}
                                                            onChange={(e) =>
                                                                setComment(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() =>
                                                                setDialogOpen(
                                                                    false
                                                                )
                                                            }
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    fix.id,
                                                                    comment
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                fix.id
                                                            }
                                                        >
                                                            Approve Fix
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                disabled={
                                                    actionLoading === fix.id
                                                }
                                                onClick={() =>
                                                    handleReject(fix.id)
                                                }
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    )}

                                    {fix.status === "approved" && (
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="default"
                                                disabled={
                                                    actionLoading === fix.id
                                                }
                                                onClick={() =>
                                                    handleApplyFix(fix.id)
                                                }
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Apply Fix
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
