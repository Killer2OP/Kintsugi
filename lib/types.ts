export interface APIResponse {
    message: string;
}

// Health Check
export interface HealthResponse {
    status: string;
    timestamp: string;
    services: {
        database: string;
        github_api: string;
        gemini_api: string;
    };
}

// Failure Types
export interface Failure {
    id: string;
    repo_name: string;
    owner: string;
    workflow_name: string;
    run_id: number;
    status: string;
    conclusion: string;
    error_log?: string;
    suggested_fix?: string;
    fix_status:
        | "pending"
        | "generated"
        | "approved"
        | "rejected"
        | "applying"
        | "applied"
        | "application_failed"
        | "approved_application_failed";
    pr_url?: string;
    fix_branch?: string;
    fix_error?: string;
    created_at: string;
}

export interface FailureDetail extends Failure {
    analysis_result?: {
        error_summary: string;
        suggested_fix: string;
        confidence_score: number;
        fix_complexity: string;
    };
}

export interface FailuresResponse {
    count: number;
    failures: Failure[];
}

export interface FailureDetailResponse {
    failure: FailureDetail;
}

// Fix Types
export interface Fix {
    id: string;
    repository?: string;
    owner?: string;
    repo_name?: string;
    run_id?: string;
    workflow_name?: string;
    description?: string;
    suggested_fix?: string;
    error_analysis?: string;
    status?:
        | "pending"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "applying"
        | "applied"
        | "application_failed"
        | "approved_application_failed";
    fix_status?:
        | "pending"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "applying"
        | "applied"
        | "application_failed"
        | "approved_application_failed";
    pr_url?: string;
    fix_branch?: string;
    fix_error?: string;
    created_at: string;
    confidence_score?: number;
    fix_complexity?: string;
}

export interface FixesResponse {
    pending_fixes: Fix[];
}

export interface FixActionResponse extends APIResponse {
    fix_id: string;
    action: string;
}

// Analytics Types
export interface DashboardSummary {
    total_failures: number;
    total_repositories: number;
    total_fixes: number;
    active_fixes: number;
    pending_fixes: number;
    approved_fixes: number;
    success_rate: number;
    avg_resolution_time: number;
    active_agents: number;
    processing_time_avg: string;
    key_metrics?: {
        total_repos_analyzed: number;
        total_failures_processed: number;
        successful_fixes: number;
        pending_fixes: number;
    };
}

export interface RecentActivity {
    id: string;
    type: "failure" | "fix" | "analysis";
    description: string;
    timestamp: string;
    status: string;
    repository: string;
    workflow?: string;
}

export interface ErrorDistribution {
    [key: string]: number;
}

export interface MLInsights {
    pattern_recognition_accuracy: number;
    fix_success_prediction: number;
    learning_progress: string;
    prediction_accuracy: number;
    patterns_detected: number;
    success_prediction: number;
}

export interface DashboardResponse {
    message: string;
    dashboard: {
        summary: DashboardSummary;
        recent_activity: RecentActivity[];
        top_failing_repositories: Array<{
            name: string;
            failures: number;
        }>;
        error_distribution: ErrorDistribution;
        ml_insights: MLInsights;
    };
}

// Patterns Analysis
export interface PatternsResponse {
    message: string;
    analysis: {
        total_runs: number;
        patterns: {
            most_failing_repos: Record<string, number>;
            common_error_types: Record<string, number>;
            language_distribution: Record<string, number>;
        };
        recommendations: string[];
    };
}

// Effectiveness Analysis
export interface EffectivenessMetrics {
    total_fixes_generated: number;
    total_fixes_approved: number;
    total_fixes_rejected: number;
    pending_fixes: number;
    overall_approval_rate: number;
    effectiveness_by_type: Record<
        string,
        {
            generated: number;
            approved: number;
            approval_rate: number;
        }
    >;
    trends: {
        weekly_improvement: number;
        learning_velocity: string;
    };
    statistics?: {
        overall_stats: {
            total_fixes: number;
            approved_fixes: number;
            rejected_fixes: number;
            pending_fixes: number;
            approval_rate: number;
        };
    };
}

export interface EffectivenessResponse {
    message: string;
    metrics: EffectivenessMetrics;
    statistics?: {
        overall_stats: {
            total_fixes: number;
            approved_fixes: number;
            rejected_fixes: number;
            pending_fixes: number;
            approval_rate: number;
        };
    };
}

// Repository Analytics
export interface RepositoryProfile {
    repository: string;
    total_runs: number;
    success_rate: number;
    most_failing_workflows: Record<string, number>;
    common_error_types: Record<string, number>;
    language_profile: {
        primary: string;
        secondary: string[];
    };
    fix_patterns: {
        most_effective: string;
        least_effective: string;
    };
    recommendations: string[];
}

export interface RepositoryAnalyticsResponse {
    message: string;
    profile: RepositoryProfile;
}

// Analysis Types
export interface AnalysisRequest {
    owner: string;
    repo: string;
    run_id: number;
}

export interface AnalysisResponse extends APIResponse {
    failure_id: string;
    owner: string;
    repo: string;
    run_id: number;
}

// Chart Data Types (for visualization)
export interface ChartDataPoint {
    name: string;
    value: number;
    fill?: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    failures: number;
    fixes: number;
    approvals: number;
}

export interface RepositoryMetrics {
    repository: string;
    failures: number;
    success_rate: number;
    avg_resolution_time: string;
}

// Status Types
export type ServiceStatus = "connected" | "available" | "unavailable" | "error";
export type FixStatus = "pending" | "generated" | "approved" | "rejected";
export type ErrorType =
    | "dependency_error"
    | "test_failure"
    | "build_failure"
    | "timeout"
    | "other";

// API Hook Types (for SWR)
export interface UseFailuresOptions {
    limit?: number;
    offset?: number;
    status?: string;
}

export interface UseAnalyticsOptions {
    daysBack?: number;
    repository?: string;
}
