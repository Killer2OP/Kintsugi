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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Code,
    FileText,
    Bug,
    Shield,
    Zap,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    PieChart,
    Target,
    RefreshCw,
    Download,
    Filter,
    Search,
    Eye,
} from "lucide-react";
import {
    useAnalytics,
    usePatterns,
    useDashboard,
    useFailures,
} from "@/hooks/use-api";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface CodeIssue {
    id: string;
    type: "security" | "performance" | "syntax" | "style" | "logic";
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    description: string;
    file: string;
    line: number;
    repository: string;
    language: string;
    fixAvailable: boolean;
    estimatedFixTime: string;
}

interface AnalysisPattern {
    pattern: string;
    frequency: number;
    impact: "high" | "medium" | "low";
    examples: string[];
    recommendation: string;
}

interface LanguageStats {
    language: string;
    files: number;
    issues: number;
    coverage: number;
    color: string;
}

function IssueCard({ issue }: { issue: CodeIssue }) {
    const getSeverityColor = (severity: string) => {
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

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "security":
                return <Shield className="h-4 w-4" />;
            case "performance":
                return <Zap className="h-4 w-4" />;
            case "syntax":
                return <Code className="h-4 w-4" />;
            case "style":
                return <FileText className="h-4 w-4" />;
            case "logic":
                return <Bug className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                        {getTypeIcon(issue.type)}
                        <div>
                            <CardTitle className="text-sm">
                                {issue.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {issue.file}:{issue.line} • {issue.language}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    {issue.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                        {issue.repository}
                    </span>
                    <span className="text-muted-foreground">
                        Fix time: {issue.estimatedFixTime}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                            const githubUrl = `https://github.com/${issue.repository}/blob/main/${issue.file}#L${issue.line}`;
                            window.open(githubUrl, "_blank");
                        }}
                    >
                        <Eye className="h-3 w-3 mr-2" />
                        View Code
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function PatternCard({ pattern }: { pattern: AnalysisPattern }) {
    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "high":
                return "text-red-600 dark:text-red-400";
            case "medium":
                return "text-yellow-600 dark:text-yellow-400";
            case "low":
                return "text-green-600 dark:text-green-400";
            default:
                return "text-gray-600 dark:text-gray-400";
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{pattern.pattern}</CardTitle>
                    <Badge
                        variant="outline"
                        className={getImpactColor(pattern.impact)}
                    >
                        {pattern.impact} impact
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium">
                        {pattern.frequency} occurrences
                    </span>
                </div>

                <p className="text-sm text-muted-foreground">
                    {pattern.recommendation}
                </p>

                <div className="text-xs">
                    <p className="text-muted-foreground mb-1">Common in:</p>
                    <div className="flex flex-wrap gap-1">
                        {pattern.examples.slice(0, 3).map((example, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                            >
                                {example}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function LanguageStatsCard({ language }: { language: LanguageStats }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${language.color}`}
                        ></div>
                        <span className="font-medium">{language.language}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {language.files} files
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Issues</span>
                        <span>{language.issues}</span>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                                Coverage
                            </span>
                            <span>{language.coverage}%</span>
                        </div>
                        <Progress value={language.coverage} className="h-1" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CodeAnalysisPage() {
    const {
        analytics,
        isLoading: analyticsLoading,
        refresh: refreshAnalytics,
    } = useAnalytics();
    const {
        patterns,
        recommendations,
        isLoading: patternsLoading,
    } = usePatterns();
    const { dashboard, summary, errorDistribution } = useDashboard();
    const { failures } = useFailures({ limit: 50 });

    // Generate mock code issues based on real failure data
    const codeIssues: CodeIssue[] = React.useMemo(() => {
        const mockIssues: CodeIssue[] = [];

        failures?.forEach((failure: any, index: number) => {
            const files = [
                "src/broken_app.py",
                "src/api_client.py",
                "src/data_processor.py",
                "src/web_scraper.py",
                "src/database_manager.js",
                "src/broken-app.js",
            ];
            const languages = [
                "Python",
                "Python",
                "Python",
                "Python",
                "JavaScript",
                "JavaScript",
            ];
            const types: Array<
                "security" | "performance" | "syntax" | "style" | "logic"
            > = ["security", "performance", "syntax", "style", "logic"];
            const severities: Array<"critical" | "high" | "medium" | "low"> = [
                "critical",
                "high",
                "medium",
                "low",
            ];

            const fileIndex = index % files.length;
            mockIssues.push({
                id: `issue-${index}`,
                type: types[index % types.length],
                severity: severities[index % severities.length],
                title: `${
                    failure.workflow_name || "Workflow"
                } failure analysis`,
                description: `Analysis of workflow failure in ${
                    failure.repo_name || "repository"
                }`,
                file: files[fileIndex],
                line: Math.floor(Math.random() * 200) + 1,
                repository: failure.repo_name?.includes("/")
                    ? failure.repo_name
                    : `chaitanyak175/${failure.repo_name || "ci-cd-test-repo"}`,
                language: languages[fileIndex],
                fixAvailable: Math.random() > 0.3,
                estimatedFixTime: `${Math.floor(Math.random() * 30) + 5}min`,
            });
        });

        return mockIssues.slice(0, 12);
    }, [failures]);

    const analysisPatterns: AnalysisPattern[] = React.useMemo(() => {
        const patternData = patterns || {};
        const errorTypes = errorDistribution || {};

        return Object.entries(errorTypes)
            .map(([pattern, frequency], index) => ({
                pattern: pattern
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                frequency: Number(frequency),
                impact: (index % 3 === 0
                    ? "high"
                    : index % 3 === 1
                    ? "medium"
                    : "low") as "high" | "medium" | "low",
                examples: ["Node.js", "Python", "Docker"].slice(
                    0,
                    Math.floor(Math.random() * 3) + 1
                ),
                recommendation: `Address ${pattern.replace(
                    /_/g,
                    " "
                )} issues by implementing better error handling and validation.`,
            }))
            .slice(0, 6);
    }, [patterns, errorDistribution]);

    const languageStats: LanguageStats[] = [
        {
            language: "Python",
            files: 24,
            issues: 8,
            coverage: 85,
            color: "bg-blue-500",
        },
        {
            language: "JavaScript",
            files: 18,
            issues: 12,
            coverage: 78,
            color: "bg-yellow-500",
        },
        {
            language: "TypeScript",
            files: 15,
            issues: 5,
            coverage: 92,
            color: "bg-blue-600",
        },
        {
            language: "Docker",
            files: 8,
            issues: 3,
            coverage: 88,
            color: "bg-cyan-500",
        },
        {
            language: "YAML",
            files: 12,
            issues: 2,
            coverage: 95,
            color: "bg-purple-500",
        },
    ];

    const analysisStats = {
        totalFiles: languageStats.reduce((acc, lang) => acc + lang.files, 0),
        totalIssues: codeIssues.length,
        criticalIssues: codeIssues.filter(
            (issue) => issue.severity === "critical"
        ).length,
        fixableIssues: codeIssues.filter((issue) => issue.fixAvailable).length,
        averageCoverage: Math.round(
            languageStats.reduce((acc, lang) => acc + lang.coverage, 0) /
                languageStats.length
        ),
    };

    const isLoading = analyticsLoading || patternsLoading;

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
                                Analyzing code patterns...
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
                                Code Analysis
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                AI-powered code analysis and pattern detection
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                onClick={() => refreshAnalytics()}
                                className="w-full sm:w-auto"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button className="w-full sm:w-auto">
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-950/30">
                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Files Analyzed
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {analysisStats.totalFiles}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-950/30">
                                        <Bug className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Issues Found
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {analysisStats.totalIssues}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-full dark:bg-red-950/30">
                                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Critical
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {analysisStats.criticalIssues}
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
                                            Auto-Fixable
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {analysisStats.fixableIssues}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-full dark:bg-purple-950/30">
                                        <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Coverage
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {analysisStats.averageCoverage}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="issues" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="issues">
                                Code Issues
                            </TabsTrigger>
                            <TabsTrigger value="patterns">Patterns</TabsTrigger>
                            <TabsTrigger value="languages">
                                Languages
                            </TabsTrigger>
                            <TabsTrigger value="trends">Trends</TabsTrigger>
                        </TabsList>

                        <TabsContent value="issues" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Bug className="h-5 w-5" />
                                                Code Issues
                                            </CardTitle>
                                            <CardDescription>
                                                AI-detected issues and
                                                recommendations
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filter
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Search className="h-4 w-4 mr-2" />
                                                Search
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {codeIssues.length > 0 ? (
                                        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                                            {codeIssues.map((issue) => (
                                                <IssueCard
                                                    key={issue.id}
                                                    issue={issue}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>
                                                No issues found in analyzed code
                                            </p>
                                            <p className="text-sm">
                                                Your code is looking great!
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="patterns" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5" />
                                        Analysis Patterns
                                    </CardTitle>
                                    <CardDescription>
                                        Common patterns and anti-patterns
                                        detected
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {analysisPatterns.length > 0 ? (
                                        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                                            {analysisPatterns.map(
                                                (pattern, index) => (
                                                    <PatternCard
                                                        key={index}
                                                        pattern={pattern}
                                                    />
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No patterns detected yet</p>
                                            <p className="text-sm">
                                                Run more analyses to identify
                                                patterns
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="languages" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Code className="h-5 w-5" />
                                        Language Statistics
                                    </CardTitle>
                                    <CardDescription>
                                        Analysis breakdown by programming
                                        language
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {languageStats.map(
                                            (language, index) => (
                                                <LanguageStatsCard
                                                    key={index}
                                                    language={language}
                                                />
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="trends" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Analysis Trends
                                    </CardTitle>
                                    <CardDescription>
                                        Code quality trends and improvements
                                        over time
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-muted-foreground">
                                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Trend analysis coming soon</p>
                                        <p className="text-sm">
                                            Historical data will be available
                                            after more analyses
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
