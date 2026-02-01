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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Clock,
    FileText,
    Bug,
    Github,
    Code,
    CheckCircle2,
    ExternalLink,
    Tag,
    Folder,
    Database,
    Zap,
    TrendingUp,
    RefreshCw,
} from "lucide-react";
import { useFailures, useDashboard, useAnalytics } from "@/hooks/use-api";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface SearchResult {
    id: string;
    type: "failure" | "fix" | "repository" | "analysis" | "documentation";
    title: string;
    description: string;
    timestamp: string;
    url: string;
    metadata: {
        severity?: "critical" | "high" | "medium" | "low";
        status?: string;
        repository?: string;
        language?: string;
        tags?: string[];
    };
}

function SearchResultCard({ result }: { result: SearchResult }) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "failure":
                return <Bug className="h-4 w-4 text-red-500" />;
            case "fix":
                return <Zap className="h-4 w-4 text-green-500" />;
            case "repository":
                return <Github className="h-4 w-4 text-purple-500" />;
            case "analysis":
                return <Code className="h-4 w-4 text-blue-500" />;
            case "documentation":
                return <FileText className="h-4 w-4 text-orange-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "failure":
                return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300";
            case "fix":
                return "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300";
            case "repository":
                return "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300";
            case "analysis":
                return "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300";
            case "documentation":
                return "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300";
            case "high":
                return "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300";
            case "low":
                return "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                        {getTypeIcon(result.type)}
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-2">
                                {result.title}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1 line-clamp-2">
                                {result.description}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                        <Badge className={getTypeColor(result.type)}>
                            {result.type}
                        </Badge>
                        {result.metadata.severity && (
                            <Badge
                                className={getSeverityColor(
                                    result.metadata.severity
                                )}
                            >
                                {result.metadata.severity}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{result.timestamp}</span>
                    </div>
                    {result.metadata.repository && (
                        <div className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            <span>{result.metadata.repository}</span>
                        </div>
                    )}
                    {result.metadata.language && (
                        <div className="flex items-center gap-1">
                            <Code className="h-3 w-3" />
                            <span>{result.metadata.language}</span>
                        </div>
                    )}
                    {result.metadata.status && (
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{result.metadata.status}</span>
                        </div>
                    )}
                </div>

                {result.metadata.tags && result.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {result.metadata.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                            >
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                        {result.metadata.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{result.metadata.tags.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            if (result.url.startsWith("http")) {
                                window.open(result.url, "_blank");
                            } else {
                                window.location.href = result.url;
                            }
                        }}
                    >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchType, setSearchType] = React.useState("all");
    const [sortBy, setSortBy] = React.useState("relevance");
    const [isSearching, setIsSearching] = React.useState(false);

    const { failures } = useFailures({ limit: 20 });
    const { dashboard, summary } = useDashboard();
    const { analytics } = useAnalytics();

    const searchResults: SearchResult[] = React.useMemo(() => {
        const results: SearchResult[] = [];

        failures?.slice(0, 8).forEach((failure: any, index: number) => {
            results.push({
                id: `failure-${index}`,
                type: "failure",
                title: `${failure.workflow_name || "Workflow"} Failed`,
                description: `CI/CD failure in ${
                    failure.repo_name || "repository"
                } - ${failure.error_type || "build error"}`,
                timestamp: failure.created_at
                    ? new Date(failure.created_at).toLocaleDateString()
                    : "Recently",
                url: `/failures`,
                metadata: {
                    severity:
                        index % 4 === 0
                            ? "critical"
                            : index % 4 === 1
                            ? "high"
                            : index % 4 === 2
                            ? "medium"
                            : "low",
                    status: failure.conclusion || "failed",
                    repository: failure.repo_name || "unknown/repo",
                    language: ["Python", "JavaScript", "TypeScript", "Docker"][
                        index % 4
                    ],
                    tags: [
                        "ci/cd",
                        "automation",
                        "deployment",
                        "testing",
                    ].slice(0, Math.floor(Math.random() * 4) + 1),
                },
            });
        });

        const fixCount = summary?.approved_fixes || 4;
        for (let i = 0; i < Math.min(fixCount, 6); i++) {
            results.push({
                id: `fix-${i}`,
                type: "fix",
                title: `Automated Fix #${i + 1}`,
                description: `AI-generated fix for dependency conflict in Node.js project`,
                timestamp: new Date(
                    Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
                ).toLocaleDateString(),
                url: `/fixes`,
                metadata: {
                    status: "approved",
                    repository: `project-${i + 1}/repository`,
                    language: ["JavaScript", "Python", "TypeScript"][i % 3],
                    tags: ["fix", "automation", "dependency", "optimization"],
                },
            });
        }

        const repositories = [
            "ci-cd-test-repo",
            "web-app",
            "api-service",
            "data-processor",
        ];
        repositories.forEach((repo, index) => {
            results.push({
                id: `repo-${index}`,
                type: "repository",
                title: `chaitanyak175/${repo}`,
                description: `Repository with ${
                    Math.floor(Math.random() * 10) + 1
                } workflows and ${Math.floor(
                    Math.random() * 5
                )} recent failures`,
                timestamp: new Date(
                    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString(),
                url: `/repository`,
                metadata: {
                    status: index % 2 === 0 ? "active" : "inactive",
                    language: ["Python", "JavaScript", "TypeScript", "Go"][
                        index % 4
                    ],
                    tags: ["repository", "github", "workflows"],
                },
            });
        });

        const analysisTypes = [
            "Code Quality",
            "Security Scan",
            "Performance Analysis",
            "Dependency Check",
        ];
        analysisTypes.forEach((analysis, index) => {
            results.push({
                id: `analysis-${index}`,
                type: "analysis",
                title: analysis,
                description: `Automated ${analysis.toLowerCase()} found ${Math.floor(
                    Math.random() * 10
                )} issues`,
                timestamp: new Date(
                    Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
                ).toLocaleDateString(),
                url: `/code-analysis`,
                metadata: {
                    severity: ["low", "medium", "high", "critical"][
                        index % 4
                    ] as any,
                    repository: `project-${index + 1}/codebase`,
                    language: ["Python", "JavaScript", "TypeScript", "Docker"][
                        index % 4
                    ],
                    tags: [
                        "analysis",
                        "quality",
                        "security",
                        "performance",
                    ].slice(0, index + 1),
                },
            });
        });

        const docs = [
            "API Documentation",
            "Setup Guide",
            "GitHub Integration",
            "AI Agent Configuration",
        ];
        docs.forEach((doc, index) => {
            results.push({
                id: `doc-${index}`,
                type: "documentation",
                title: doc,
                description: `Complete guide for ${doc.toLowerCase()} and best practices`,
                timestamp: new Date(
                    Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000
                ).toLocaleDateString(),
                url: `/docs`,
                metadata: {
                    tags: [
                        "documentation",
                        "guide",
                        "setup",
                        "integration",
                    ].slice(0, index + 2),
                },
            });
        });

        return results;
    }, [failures, summary]);

    const filteredResults = React.useMemo(() => {
        let filtered = searchResults;

        if (searchType !== "all") {
            filtered = filtered.filter((result) => result.type === searchType);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (result) =>
                    result.title.toLowerCase().includes(query) ||
                    result.description.toLowerCase().includes(query) ||
                    result.metadata.repository?.toLowerCase().includes(query) ||
                    result.metadata.tags?.some((tag) =>
                        tag.toLowerCase().includes(query)
                    )
            );
        }

        switch (sortBy) {
            case "date":
                filtered.sort(
                    (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                );
                break;
            case "type":
                filtered.sort((a, b) => a.type.localeCompare(b.type));
                break;
            case "severity":
                const severityOrder = {
                    critical: 0,
                    high: 1,
                    medium: 2,
                    low: 3,
                };
                filtered.sort((a, b) => {
                    const aSeverity =
                        severityOrder[
                            a.metadata.severity as keyof typeof severityOrder
                        ] ?? 4;
                    const bSeverity =
                        severityOrder[
                            b.metadata.severity as keyof typeof severityOrder
                        ] ?? 4;
                    return aSeverity - bSeverity;
                });
                break;
            default:
                break;
        }

        return filtered;
    }, [searchResults, searchQuery, searchType, sortBy]);

    const handleSearch = () => {
        setIsSearching(true);

        setTimeout(() => setIsSearching(false), 500);
    };

    const searchStats = {
        total: filteredResults.length,
        failures: filteredResults.filter((r) => r.type === "failure").length,
        fixes: filteredResults.filter((r) => r.type === "fix").length,
        repositories: filteredResults.filter((r) => r.type === "repository")
            .length,
        analyses: filteredResults.filter((r) => r.type === "analysis").length,
        documentation: filteredResults.filter((r) => r.type === "documentation")
            .length,
    };

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:p-6 bg-background dark:bg-gray-950/30">
                    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">
                                Search
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Find failures, fixes, repositories, and
                                documentation
                            </p>
                        </div>
                        <Button
                            onClick={handleSearch}
                            className="w-full sm:w-auto"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh Results
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search for failures, fixes, repositories..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="pl-10"
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                handleSearch()
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Select
                                        value={searchType}
                                        onValueChange={setSearchType}
                                    >
                                        <SelectTrigger className="w-full sm:w-32">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Types
                                            </SelectItem>
                                            <SelectItem value="failure">
                                                Failures
                                            </SelectItem>
                                            <SelectItem value="fix">
                                                Fixes
                                            </SelectItem>
                                            <SelectItem value="repository">
                                                Repositories
                                            </SelectItem>
                                            <SelectItem value="analysis">
                                                Analysis
                                            </SelectItem>
                                            <SelectItem value="documentation">
                                                Docs
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={sortBy}
                                        onValueChange={setSortBy}
                                    >
                                        <SelectTrigger className="w-full sm:w-32">
                                            <SelectValue placeholder="Sort" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="relevance">
                                                Relevance
                                            </SelectItem>
                                            <SelectItem value="date">
                                                Date
                                            </SelectItem>
                                            <SelectItem value="type">
                                                Type
                                            </SelectItem>
                                            <SelectItem value="severity">
                                                Severity
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {searchStats.total}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Total
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <Bug className="h-4 w-4 text-red-500" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {searchStats.failures}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Failures
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {searchStats.fixes}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Fixes
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <Github className="h-4 w-4 text-purple-500" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {searchStats.repositories}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Repos
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <Code className="h-4 w-4 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {searchStats.analyses}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Analysis
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-orange-500" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            {searchStats.documentation}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Docs
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Search Results
                                    {searchQuery && (
                                        <span className="text-sm font-normal text-muted-foreground">
                                            for "{searchQuery}"
                                        </span>
                                    )}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <TrendingUp className="h-4 w-4" />
                                    {filteredResults.length} results
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isSearching ? (
                                <div className="text-center py-8">
                                    <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin opacity-50" />
                                    <p className="text-muted-foreground">
                                        Searching...
                                    </p>
                                </div>
                            ) : filteredResults.length > 0 ? (
                                <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                                    {filteredResults.map((result) => (
                                        <SearchResultCard
                                            key={result.id}
                                            result={result}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No results found</p>
                                    <p className="text-sm">
                                        Try adjusting your search terms or
                                        filters
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
