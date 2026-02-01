import React from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import type {
    HealthResponse,
    FailuresResponse,
    FailureDetailResponse,
    FixesResponse,
    DashboardResponse,
    PatternsResponse,
    EffectivenessResponse,
    RepositoryAnalyticsResponse,
    UseFailuresOptions,
    UseAnalyticsOptions,
} from "@/lib/types";

// Health Hook
export function useHealth() {
    const { data, error, mutate } = useSWR<HealthResponse>(
        "/health",
        () => api.getHealth(),
        {
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
        }
    );

    return {
        health: data,
        isLoading: !error && !data,
        error,
        refresh: mutate,
        isHealthy: data?.status === "healthy",
    };
}

// Failures Hook
export function useFailures(options?: UseFailuresOptions) {
    const { data, error, mutate } = useSWR<FailuresResponse>(
        ["/failures", options],
        () => api.getFailures(options),
        {
            refreshInterval: 8000, // Refresh every 8 seconds
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 3000, // Reduce deduping interval
        }
    );

    return {
        failures: data?.failures || [],
        totalCount: data?.count || 0,
        isLoading: !error && !data,
        error,
        refresh: mutate,
    };
}

export function useFailure(id: string) {
    const { data, error, mutate } = useSWR<FailureDetailResponse>(
        id ? `/failures/${id}` : null,
        () => api.getFailure(id),
        {
            refreshInterval: 30000,
        }
    );

    return {
        failure: data?.failure,
        isLoading: !error && !data,
        error,
        refresh: mutate,
    };
}

export function useFixes() {
    const { data, error, mutate } = useSWR<FixesResponse>(
        "/fixes",
        () => api.getFixes(),
        {
            refreshInterval: 10000, // Refresh every 10 seconds
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000, // Reduce deduping interval
        }
    );

    // Transform API data to match component expectations
    const transformedFixes = React.useMemo(() => {
        if (!data?.pending_fixes) return [];

        return data.pending_fixes.map((fix: any) => ({
            ...fix,
            id: fix.id.toString(), // Ensure id is string
            status: fix.fix_status, // Map fix_status to status
            repository:
                fix.owner && fix.repo_name
                    ? `${fix.owner}/${fix.repo_name}`
                    : fix.repo_name || "", // Combine owner/repo_name
        }));
    }, [data]);

    return {
        fixes: transformedFixes,
        isLoading: !error && !data,
        error,
        refresh: mutate,
    };
}

// Analytics Hook
export function useAnalytics() {
    const { data, error, mutate } = useSWR<EffectivenessResponse>(
        "/analytics/effectiveness",
        () => api.getEffectiveness(),
        {
            refreshInterval: 60000, // Refresh every 60 seconds
            revalidateOnFocus: true,
        }
    );

    return {
        analytics: data?.metrics || data?.statistics || data, // Handle different response structures
        isLoading: !error && !data,
        error,
        refresh: mutate,
    };
}

// Dashboard Hook
export function useDashboard() {
    const { data, error, mutate } = useSWR<DashboardResponse>(
        "/analytics/dashboard",
        () => api.getDashboard(),
        {
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: true,
        }
    );

    return {
        dashboard: data?.dashboard,
        summary: data?.dashboard?.summary,
        recentActivity: data?.dashboard?.recent_activity || [],
        topFailingRepos: data?.dashboard?.top_failing_repositories || [],
        errorDistribution: data?.dashboard?.error_distribution || {},
        mlInsights: data?.dashboard?.ml_insights,
        isLoading: !error && !data,
        error,
        refresh: mutate,
    };
}

// Patterns Hook
export function usePatterns(options?: UseAnalyticsOptions) {
    const { data, error, mutate } = useSWR<PatternsResponse>(
        ["/analytics/patterns", options?.daysBack],
        () => api.getPatterns(options?.daysBack),
        {
            refreshInterval: 60000, // Refresh every minute
        }
    );

    return {
        patterns: data?.analysis?.patterns,
        totalRuns: data?.analysis?.total_runs || 0,
        recommendations: data?.analysis?.recommendations || [],
        isLoading: !error && !data,
        error,
        refresh: mutate,
    };
}

// Effectiveness Hook
export function useEffectiveness() {
    const { data, error, mutate } = useSWR<EffectivenessResponse>(
        "/analytics/effectiveness",
        () => api.getEffectiveness(),
        {
            refreshInterval: 60000, // Refresh every minute
        }
    );

    return {
        metrics: data?.metrics,
        isLoading: !error && !data,
        error,
        refresh: mutate,
    };
}

// Repository Analytics Hook
export function useRepositoryAnalytics(owner: string, repo: string) {
    const { data, error, mutate } = useSWR<RepositoryAnalyticsResponse>(
        owner && repo ? `/analytics/repository/${owner}/${repo}` : null,
        () => api.getRepositoryAnalytics(owner, repo),
        {
            refreshInterval: 120000, // Refresh every 2 minutes
        }
    );

    return {
        profile: data?.profile,
        isLoading: !error && !data,
        error,
        refresh: mutate,
    };
}

// Combined Dashboard Data Hook
export function useDashboardData() {
    const health = useHealth();
    const dashboard = useDashboard();
    const failures = useFailures({ limit: 10 });
    const fixes = useFixes();
    const effectiveness = useEffectiveness();

    return {
        health,
        dashboard,
        failures,
        fixes,
        effectiveness,
        isLoading:
            health.isLoading ||
            dashboard.isLoading ||
            failures.isLoading ||
            fixes.isLoading ||
            effectiveness.isLoading,
        error:
            health.error ||
            dashboard.error ||
            failures.error ||
            fixes.error ||
            effectiveness.error,
        refresh: () => {
            health.refresh();
            dashboard.refresh();
            failures.refresh();
            fixes.refresh();
            effectiveness.refresh();
        },
    };
}
