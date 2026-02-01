// API Configuration and Client for Kintsugi
import type {
    HealthResponse,
    FailuresResponse,
    FailureDetailResponse,
    FixesResponse,
    FixActionResponse,
    DashboardResponse,
    PatternsResponse,
    EffectivenessResponse,
    RepositoryAnalyticsResponse,
    AnalysisResponse,
} from "./types";

// Use local Next.js API routes by default, fallback to remote backend if configured
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "/api";

class APIClient {
    private baseURL: string;

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(
                `API Error: ${response.status} ${response.statusText}`
            );
        }

        return response.json();
    }

    // Health Check
    async getHealth(): Promise<HealthResponse> {
        return this.request<HealthResponse>("/health");
    }

    // Failures
    async getFailures(params?: {
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<FailuresResponse> {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.set("limit", params.limit.toString());
        if (params?.offset)
            searchParams.set("offset", params.offset.toString());
        if (params?.status) searchParams.set("status", params.status);

        const query = searchParams.toString();
        return this.request<FailuresResponse>(
            `/failures${query ? `?${query}` : ""}`
        );
    }

    async getFailure(id: string): Promise<FailureDetailResponse> {
        return this.request<FailureDetailResponse>(`/failures/${id}`);
    }

    // Fixes
    async getFixes(): Promise<FixesResponse> {
        return this.request<FixesResponse>("/fixes");
    }

    async approveFix(id: string, comment?: string): Promise<FixActionResponse> {
        return this.request<FixActionResponse>(`/fixes/${id}/approve`, {
            method: "POST",
            body: JSON.stringify({ action: "approve", comment }),
        });
    }

    async rejectFix(id: string, comment?: string): Promise<FixActionResponse> {
        return this.request<FixActionResponse>(`/fixes/${id}/reject`, {
            method: "POST",
            body: JSON.stringify({ action: "reject", comment }),
        });
    }

    async applyFix(id: string): Promise<FixActionResponse> {
        return this.request<FixActionResponse>(`/fixes/${id}/apply`, {
            method: "POST",
        });
    }

    async getFixStatus(id: string): Promise<{
        fix_id: string;
        status: string;
        pr_url?: string;
        branch_name?: string;
        error_message?: string;
        created_at: string;
        updated_at: string;
    }> {
        return this.request(`/fixes/${id}/status`);
    }

    // Analytics
    async getDashboard(): Promise<DashboardResponse> {
        // Fetch both dashboard analytics and recent failures for complete data
        const [dashboardResponse, recentFailures] = await Promise.all([
            this.request<any>("/analytics/dashboard"),
            this.request<any>("/failures?limit=5"),
        ]);

        const fixStats =
            dashboardResponse.dashboard?.fix_effectiveness?.overall_stats || {};
        const failurePatterns =
            dashboardResponse.dashboard?.failure_patterns || {};
        const keyMetrics = dashboardResponse.dashboard?.key_metrics || {};

        const recentActivity = (recentFailures.failures || []).map(
            (failure: any) => ({
                id: failure.id.toString(),
                type: "failure" as const,
                description: `${failure.workflow_name} failed in ${failure.repo_name}`,
                timestamp: failure.created_at,
                status: failure.conclusion || failure.status,
                repository: failure.repo_name,
                workflow: failure.workflow_name,
            })
        );

        return {
            message: dashboardResponse.message,
            dashboard: {
                summary: {
                    total_failures: failurePatterns.total_runs || 0,
                    total_repositories:
                        failurePatterns.patterns?.total_unique_repos ||
                        keyMetrics.total_repos_analyzed ||
                        0,
                    total_fixes: fixStats.total_fixes || 0,
                    active_fixes: fixStats.pending_fixes || 0,
                    pending_fixes: fixStats.pending_fixes || 0,
                    approved_fixes: fixStats.approved_fixes || 0,
                    success_rate: (fixStats.approval_rate || 0) * 100,
                    avg_resolution_time: 0,
                    active_agents: 1,
                    processing_time_avg: "Real-time",
                },
                recent_activity: recentActivity,
                top_failing_repositories: Object.entries(
                    failurePatterns.patterns?.most_failing_repos || {}
                ).map(([name, failures]) => ({
                    name,
                    failures: failures as number,
                })),
                error_distribution:
                    failurePatterns.patterns?.common_error_types || {},
                ml_insights: {
                    pattern_recognition_accuracy:
                        (keyMetrics.overall_fix_approval_rate || 0) * 100,
                    fix_success_prediction: (fixStats.approval_rate || 0) * 100,
                    learning_progress: `${
                        Object.keys(
                            failurePatterns.patterns?.common_error_types || {}
                        ).length
                    } patterns identified`,
                    prediction_accuracy: (fixStats.approval_rate || 0) * 100,
                    patterns_detected: Object.keys(
                        failurePatterns.patterns?.common_error_types || {}
                    ).length,
                    success_prediction: (fixStats.approval_rate || 0) * 100,
                },
            },
        };
    }
    async getAnalytics(): Promise<EffectivenessResponse> {
        return this.request<EffectivenessResponse>("/analytics/effectiveness");
    }

    async getPatterns(daysBack?: number): Promise<PatternsResponse> {
        const query = daysBack ? `?days_back=${daysBack}` : "";
        return this.request<PatternsResponse>(`/analytics/patterns${query}`);
    }

    async getEffectiveness(): Promise<EffectivenessResponse> {
        return this.request<EffectivenessResponse>("/analytics/effectiveness");
    }

    async getRepositoryAnalytics(
        owner: string,
        repo: string
    ): Promise<RepositoryAnalyticsResponse> {
        return this.request<RepositoryAnalyticsResponse>(
            `/analytics/repository/${owner}/${repo}`
        );
    }

    // Manual Analysis
    async triggerAnalysis(data: {
        owner: string;
        repo: string;
        run_id: number;
    }): Promise<AnalysisResponse> {
        return this.request<AnalysisResponse>("/analyze", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    // Manual Scan
    async triggerManualScan(): Promise<{ message: string }> {
        return this.request<{ message: string }>("/scan/manual", {
            method: "POST",
        });
    }

    // Test Webhook
    async testWebhook(): Promise<{ message: string }> {
        return this.request<{ message: string }>("/webhook/test", {
            method: "POST",
        });
    }

    // Force Gemini Analysis
    async forceGeminiAnalysis(): Promise<{ message: string }> {
        return this.request<{ message: string }>("/analyze/gemini/force", {
            method: "POST",
        });
    }

    // Export Analytics
    async exportAnalytics(): Promise<Blob> {
        const response = await fetch(`${this.baseURL}/analytics/export`, {
            method: "GET",
            headers: {
                Accept: "text/csv",
            },
        });

        if (!response.ok) {
            throw new Error(`Export failed: ${response.status}`);
        }

        return response.blob();
    }
}

export const apiClient = new APIClient();

export const api = {
    getHealth: () => apiClient.getHealth(),
    getFailures: (params?: Parameters<typeof apiClient.getFailures>[0]) =>
        apiClient.getFailures(params),
    getFailure: (id: string) => apiClient.getFailure(id),
    getFixes: () => apiClient.getFixes(),
    approveFix: (id: string, comment?: string) =>
        apiClient.approveFix(id, comment),
    rejectFix: (id: string, comment?: string) =>
        apiClient.rejectFix(id, comment),
    applyFix: (id: string) => apiClient.applyFix(id),
    getDashboard: () => apiClient.getDashboard(),
    getAnalytics: () => apiClient.getAnalytics(),
    getPatterns: (daysBack?: number) => apiClient.getPatterns(daysBack),
    getEffectiveness: () => apiClient.getEffectiveness(),
    getRepositoryAnalytics: (owner: string, repo: string) =>
        apiClient.getRepositoryAnalytics(owner, repo),
    triggerAnalysis: (data: { owner: string; repo: string; run_id: number }) =>
        apiClient.triggerAnalysis(data),
    triggerManualScan: () => apiClient.triggerManualScan(),
    testWebhook: () => apiClient.testWebhook(),
    forceGeminiAnalysis: () => apiClient.forceGeminiAnalysis(),
    exportAnalytics: () => apiClient.exportAnalytics(),
};
