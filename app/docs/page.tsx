"use client";

import * as React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Book,
    Code,
    Rocket,
    Bot,
    Database,
    Github,
    ExternalLink,
    Copy,
    Activity,
    Terminal,
    CheckCircle,
    Info,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface APIEndpoint {
    method: string;
    endpoint: string;
    description: string;
    example?: string;
    response?: string;
}

const apiEndpoints: APIEndpoint[] = [
    {
        method: "GET",
        endpoint: "/health",
        description: "Check Kintsugi system health and all connected services status",
        example: `curl http://localhost:3000/api/health`,
        response: `{
  "status": "healthy",
  "timestamp": "2026-02-01T10:30:00Z",
  "services": {
    "database": "connected",
    "github_api": "available",
    "gemini_api": "available"
  }
}`,
    },
    {
        method: "GET",
        endpoint: "/failures",
        description: "Retrieve all workflow failures tracked by Kintsugi",
        example: `curl http://localhost:3000/api/failures`,
        response: `{
  "failures": [
    {
      "id": 1,
      "repo_name": "ci-cd-test-repo",
      "owner": "demo-user",
      "workflow_name": "Node.js CI",
      "status": "completed",
      "conclusion": "failure",
      "error_category": "dependency_error",
      "fix_status": "pending",
      "confidence_score": 0.85
    }
  ],
  "count": 8,
  "source": "database"
}`,
    },
    {
        method: "GET",
        endpoint: "/analytics/dashboard",
        description: "Get comprehensive analytics and ML insights from Kintsugi",
        example: `curl http://localhost:3000/api/analytics/dashboard`,
        response: `{
  "dashboard": {
    "failure_patterns": {
      "total_runs": 8,
      "patterns": {
        "common_error_types": {
          "test_failure": 3,
          "dependency_error": 2,
          "build_failure": 1
        }
      }
    },
    "fix_effectiveness": {
      "total_fixes": 8,
      "approved_fixes": 1,
      "approval_rate": 12.5
    }
  }
}`,
    },
    {
        method: "POST",
        endpoint: "/analyze",
        description: "Trigger Kintsugi AI analysis on a GitHub workflow failure",
        example: `curl -X POST http://localhost:3000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "owner": "your-username",
    "repo": "your-repo",
    "run_id": 12345678901
  }'`,
        response: `{
  "message": "Analysis triggered successfully",
  "failure_id": "1",
  "status": "analyzing",
  "run_id": 12345678901
}`,
    },
    {
        method: "GET",
        endpoint: "/fixes",
        description: "List all pending fixes awaiting human approval",
        example: `curl http://localhost:3000/api/fixes`,
        response: `{
  "pending_fixes": [
    {
      "id": 1,
      "repo_name": "ci-cd-test-repo",
      "suggested_fix": "Update package.json dependencies...",
      "confidence_score": 0.85,
      "fix_status": "pending",
      "error_category": "dependency_error"
    }
  ],
  "count": 5
}`,
    },
    {
        method: "POST",
        endpoint: "/fixes/{fix_id}/approve",
        description: "Approve a Kintsugi-generated fix for automatic implementation",
        example: `curl -X POST http://localhost:3000/api/fixes/1/approve \\
  -H "Content-Type: application/json" \\
  -d '{"apply_fix": true}'`,
        response: `{
  "message": "Fix approved successfully",
  "fix_id": 1,
  "status": "approved",
  "pr_created": true,
  "pr_url": "https://github.com/owner/repo/pull/42"
}`,
    },
    {
        method: "POST",
        endpoint: "/fixes/{fix_id}/reject",
        description: "Reject a suggested fix with optional feedback",
        example: `curl -X POST http://localhost:3000/api/fixes/1/reject \\
  -H "Content-Type: application/json" \\
  -d '{"reason": "Fix needs manual review"}'`,
        response: `{
  "message": "Fix rejected",
  "fix_id": 1,
  "status": "rejected"
}`,
    },
    {
        method: "POST",
        endpoint: "/webhook",
        description: "GitHub webhook endpoint for automatic failure detection",
        example: `# Configure in GitHub repository settings:
# URL: https://your-domain.com/api/webhook
# Content-Type: application/json
# Events: Workflow runs`,
        response: `{
  "message": "Webhook processed successfully",
  "failure_id": "8",
  "action": "workflow_run_completed"
}`,
    },
];

function CodeBlock({
    children,
    className = "",
}: {
    children: string;
    className?: string;
}) {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(children);
    };

    return (
        <div className={`relative ${className}`}>
            <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm max-w-full">
                <code className="break-words">{children}</code>
            </pre>
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={copyToClipboard}
            >
                <Copy className="h-3 w-3" />
            </Button>
        </div>
    );
}

function APIEndpointCard({ endpoint }: { endpoint: APIEndpoint }) {
    const methodColors = {
        GET: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300",
        POST: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
        PUT: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300",
        DELETE: "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300",
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:gap-3 sm:space-y-0">
                    <Badge
                        className={
                            methodColors[
                                endpoint.method as keyof typeof methodColors
                            ]
                        }
                    >
                        {endpoint.method}
                    </Badge>
                    <code className="font-mono text-sm bg-muted px-2 py-1 rounded break-all">
                        {endpoint.endpoint}
                    </code>
                </div>
                <CardDescription className="mt-2 text-sm">
                    {endpoint.description}
                </CardDescription>
            </CardHeader>
            {(endpoint.example || endpoint.response) && (
                <CardContent className="space-y-4">
                    {endpoint.example && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Terminal className="h-4 w-4 flex-shrink-0" />
                                Example Request
                            </h4>
                            <CodeBlock>{endpoint.example}</CodeBlock>
                        </div>
                    )}
                    {endpoint.response && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Code className="h-4 w-4 flex-shrink-0" />
                                Example Response
                            </h4>
                            <CodeBlock>{endpoint.response}</CodeBlock>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

export default function DocumentationPage() {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
                    {/* Header */}
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                                <Book className="h-6 w-6 lg:h-8 lg:w-8" />
                                Documentation
                            </h1>
                            <p className="text-muted-foreground text-sm lg:text-base">
                                Complete guide to the Kintsugi system
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                asChild
                                className="w-full sm:w-auto"
                            >
                                <a
                                    href="/api/docs"
                                    target="_blank"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">
                                        Swagger UI
                                    </span>
                                    <span className="sm:hidden">API Docs</span>
                                </a>
                            </Button>
                            <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-800 justify-center sm:justify-start"
                            >
                                <Activity className="h-3 w-3 mr-1" />
                                Live Production
                            </Badge>
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <div className="overflow-x-auto">
                            <TabsList className="grid w-full grid-cols-4 min-w-[400px]">
                                <TabsTrigger
                                    value="overview"
                                    className="text-xs sm:text-sm"
                                >
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="api"
                                    className="text-xs sm:text-sm"
                                >
                                    API Ref
                                </TabsTrigger>
                                <TabsTrigger
                                    value="setup"
                                    className="text-xs sm:text-sm"
                                >
                                    Setup
                                </TabsTrigger>
                                <TabsTrigger
                                    value="examples"
                                    className="text-xs sm:text-sm"
                                >
                                    Examples
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="space-y-6">
                            {/* System Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Rocket className="h-5 w-5" />
                                        System Overview
                                    </CardTitle>
                                    <CardDescription>
                                        Kintsugi - Intelligent CI/CD failure analysis and
                                        auto-repair platform powered by AI
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-green-600">
                                                8
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Failures Tracked
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">
                                                5
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Pending Fixes
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-muted rounded-lg sm:col-span-2 lg:col-span-1">
                                            <div className="text-2xl font-bold text-purple-600">
                                                100%
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                AI Analysis Rate
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <h3 className="font-semibold">
                                            Key Features
                                        </h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">
                                                    Automatic failure detection
                                                    via GitHub webhooks
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">
                                                    AI-powered analysis with
                                                    Gemini 2.5 Pro
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">
                                                    Next.js API routes with
                                                    TypeScript backend
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">
                                                    Human approval workflow for
                                                    safety
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">
                                                    ML analytics and pattern
                                                    recognition
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">
                                                    PostgreSQL audit trail
                                                    storage
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Bot className="h-5 w-5" />
                                        System Architecture
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        <Card className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Github className="h-5 w-5 text-purple-500 flex-shrink-0" />
                                                <h3 className="font-semibold text-sm lg:text-base">
                                                    GitHub Integration
                                                </h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Webhook-based failure detection
                                                and repository analysis
                                            </p>
                                        </Card>
                                        <Card className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Bot className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                                <h3 className="font-semibold text-sm lg:text-base">
                                                    AI Processing
                                                </h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Gemini 2.5 Pro for intelligent
                                                fix generation
                                            </p>
                                        </Card>
                                        <Card className="p-4 md:col-span-2 xl:col-span-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Database className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                <h3 className="font-semibold text-sm lg:text-base">
                                                    Data Storage
                                                </h3>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                PostgreSQL database with
                                                comprehensive audit trails
                                            </p>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="api" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Code className="h-5 w-5" />
                                        API Reference
                                    </CardTitle>
                                    <CardDescription>
                                        Complete API documentation for Kintsugi
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm break-all">
                                                <strong>Base URL:</strong>{" "}
                                                <span className="break-all">
                                                    /api
                                                </span>
                                            </span>
                                        </div>

                                        {apiEndpoints.map((endpoint, index) => (
                                            <APIEndpointCard
                                                key={index}
                                                endpoint={endpoint}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="setup" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Setup Guide</CardTitle>
                                    <CardDescription>
                                        How to integrate Kintsugi
                                        with your repositories
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-3">
                                            1. GitHub Webhook Setup
                                        </h3>
                                        <CodeBlock>{`# Set up webhook in your repository settings
URL: /api/webhook
Content Type: application/json
Events: Check runs, Pull requests, Workflow runs`}</CodeBlock>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">
                                            2. Repository Configuration
                                        </h3>
                                        <CodeBlock>{`# Add to your .github/workflows/main.yml
name: Kintsugi Integration
on:
  workflow_run:
    workflows: ["*"]
    types: [completed]
    
jobs:
  notify-fixer:
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - name: Notify Kintsugi
        run: |
          curl -X POST /api/analyze \\\\
            -H "Content-Type: application/json" \\\\
            -d '{
              "owner": "${"${{ github.repository_owner }}"}",
              "repo": "${"${{ github.event.repository.name }}"}",
              "run_id": "${"${{ github.run_id }}"}"
            }'`}</CodeBlock>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">
                                            3. Environment Variables
                                        </h3>
                                        <CodeBlock>{`# Required environment variables
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_url
PORTIA_CONFIG=your_portia_configuration`}</CodeBlock>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="examples" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage Examples</CardTitle>
                                    <CardDescription>
                                        Real-world examples of using Kintsugi
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-3">
                                            Check System Status
                                        </h3>
                                        <CodeBlock>{`# Quick health check
curl /api/health

# Expected response:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "gemini_api": "available"
  }
}`}</CodeBlock>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">
                                            Analyze a Failed Workflow
                                        </h3>
                                        <CodeBlock>{`# Trigger analysis for a specific GitHub Actions run
curl -X POST /api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "owner": "microsoft",
    "repo": "vscode",
    "run_id": 17152193292
  }'

# The system will:
# 1. Fetch the workflow logs from GitHub
# 2. Analyze the failure with Gemini AI
# 3. Generate intelligent fix suggestions
# 4. Store results for approval workflow`}</CodeBlock>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">
                                            View Analytics Dashboard
                                        </h3>
                                        <CodeBlock>{`# Get comprehensive analytics
curl /api/analytics/dashboard

# Returns insights including:
# - Success rates and trends
# - Repository-specific patterns
# - AI confidence scores
# - Historical analysis data`}</CodeBlock>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-3">
                                            Approve/Reject Fixes
                                        </h3>
                                        <CodeBlock>{`# Approve a generated fix
curl -X POST /api/fixes/1/approve \\
  -H "Content-Type: application/json" \\
  -d '{
    "approved": true,
    "comments": "Fix looks good, implement it"
  }'

# Reject a fix
curl -X POST /api/fixes/1/approve \\
  -H "Content-Type: application/json" \\
  -d '{
    "approved": false,
    "comments": "Need more testing before implementation"
  }'`}</CodeBlock>
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
