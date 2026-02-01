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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    User,
    Bell,
    Shield,
    Database,
    Bot,
    Github,
    Save,
    RefreshCw,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function SettingsPage() {
    const [notifications, setNotifications] = React.useState({
        email: true,
        push: false,
        failures: true,
        fixes: true,
        analytics: false,
    });

    const [aiSettings, setAiSettings] = React.useState({
        autoFix: true,
        geminiModel: "gemini-2.5-pro",
        portiaEnabled: true,
        analysisDepth: "standard",
    });

    const [githubSettings, setGithubSettings] = React.useState({
        autoWebhook: true,
        branchProtection: false,
        prComments: true,
    });

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Settings
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base">
                                Configure your Kintsugi preferences and
                                integrations
                            </p>
                        </div>
                        <Button className="w-full sm:w-auto">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Settings
                                </CardTitle>
                                <CardDescription>
                                    Manage your account information and
                                    preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Display Name
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="CI/CD Agent"
                                            defaultValue="Kintsugi"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="agent@.com"
                                            defaultValue="agent@kintsugi.ai"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="utc">
                                                UTC
                                            </SelectItem>
                                            <SelectItem value="est">
                                                Eastern Time
                                            </SelectItem>
                                            <SelectItem value="pst">
                                                Pacific Time
                                            </SelectItem>
                                            <SelectItem value="cet">
                                                Central European Time
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Notification Settings
                                </CardTitle>
                                <CardDescription>
                                    Choose how you want to be notified about
                                    CI/CD events
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive notifications via email
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={notifications.email}
                                        onCheckedChange={(checked: boolean) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                email: checked,
                                            }))
                                        }
                                    />
                                </div>
                                <Separator />
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>Failure Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when CI/CD failures
                                            occur
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={notifications.failures}
                                        onCheckedChange={(checked: boolean) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                failures: checked,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>Fix Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get notified when fixes are
                                            generated or applied
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={notifications.fixes}
                                        onCheckedChange={(checked: boolean) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                fixes: checked,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>Analytics Reports</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Weekly analytics and performance
                                            reports
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={notifications.analytics}
                                        onCheckedChange={(checked: boolean) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                analytics: checked,
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bot className="h-5 w-5" />
                                    AI Agent Configuration
                                </CardTitle>
                                <CardDescription>
                                    Configure Gemini and Portia AI agent
                                    behavior
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>Auto-Fix Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically apply fixes when
                                            confidence is high
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={aiSettings.autoFix}
                                        onCheckedChange={(checked: boolean) =>
                                            setAiSettings((prev) => ({
                                                ...prev,
                                                autoFix: checked,
                                            }))
                                        }
                                    />
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Gemini Model</Label>
                                    <Select
                                        value={aiSettings.geminiModel}
                                        onValueChange={(value) =>
                                            setAiSettings((prev) => ({
                                                ...prev,
                                                geminiModel: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gemini-2.5-pro">
                                                Gemini 2.5 Pro
                                            </SelectItem>
                                            <SelectItem value="gemini-2.0">
                                                Gemini 2.0
                                            </SelectItem>
                                            <SelectItem value="gemini-1.5">
                                                Gemini 1.5
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Analysis Depth</Label>
                                    <Select
                                        value={aiSettings.analysisDepth}
                                        onValueChange={(value) =>
                                            setAiSettings((prev) => ({
                                                ...prev,
                                                analysisDepth: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="quick">
                                                Quick Analysis
                                            </SelectItem>
                                            <SelectItem value="standard">
                                                Standard Analysis
                                            </SelectItem>
                                            <SelectItem value="deep">
                                                Deep Analysis
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>Portia Orchestrator</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enable advanced workflow
                                            orchestration
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={aiSettings.portiaEnabled}
                                        onCheckedChange={(checked: boolean) =>
                                            setAiSettings((prev) => ({
                                                ...prev,
                                                portiaEnabled: checked,
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Github className="h-5 w-5" />
                                    GitHub Integration
                                </CardTitle>
                                <CardDescription>
                                    Configure GitHub webhook and repository
                                    settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>Auto Webhook Setup</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically configure webhooks for
                                            new repositories
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={githubSettings.autoWebhook}
                                        onCheckedChange={(checked: boolean) =>
                                            setGithubSettings((prev) => ({
                                                ...prev,
                                                autoWebhook: checked,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>PR Comments</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Add AI-generated comments to pull
                                            requests
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={githubSettings.prComments}
                                        onCheckedChange={(checked: boolean) =>
                                            setGithubSettings((prev) => ({
                                                ...prev,
                                                prComments: checked,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-0.5 flex-1">
                                        <Label>Branch Protection</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Require AI approval before merging
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={
                                            githubSettings.branchProtection
                                        }
                                        onCheckedChange={(checked: boolean) =>
                                            setGithubSettings((prev) => ({
                                                ...prev,
                                                branchProtection: checked,
                                            }))
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    Database & Security
                                </CardTitle>
                                <CardDescription>
                                    Manage database connections and security
                                    settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Database URL</Label>
                                    <Input
                                        type="password"
                                        placeholder="postgresql://***"
                                        defaultValue="postgresql://***"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>API Base URL</Label>
                                    <Input
                                        defaultValue="/api (Next.js API Routes)"
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Test Connection
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Security Scan
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
