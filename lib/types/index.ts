// Core TypeScript types for Kintsugi Backend

// ============= Request Types =============

export interface AnalysisRequest {
  owner: string;
  repo: string;
  run_id: number;
}

export interface PortiaAnalysisRequest {
  owner: string;
  repo: string;
  run_id: number;
}

export interface FixApprovalRequest {
  action: 'approve' | 'reject';
  comment?: string;
}

export interface ClarificationResponse {
  response: string;
}

export interface MLPredictionRequest {
  error_log: string;
  suggested_fix: string;
  repo_context?: string;
  error_type?: string;
  language?: string;
}

export interface MLFixGenerationRequest {
  error_log: string;
  repo_context?: string;
  error_type?: string;
  language?: string;
}

export interface MLFeedbackRequest {
  error_log: string;
  suggested_fix: string;
  fix_status: 'approved' | 'rejected' | 'pending';
  repo_context?: string;
  user_feedback?: string;
  fix_effectiveness?: number;
}

export interface SimilarFixesRequest {
  error_log: string;
  repo_context?: string;
  min_similarity?: number;
}

// ============= Response Types =============

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    database: string;
    github_api: string;
    gemini_api: string;
  };
}

export interface AnalysisResponse {
  message: string;
  failure_id: string;
  owner: string;
  repo: string;
  run_id: number;
}

export interface PortiaAnalysisResponse {
  message: string;
  owner: string;
  repo: string;
  run_id: number;
  result: Record<string, unknown>;
}

// ============= Webhook Types =============

export interface WebhookPayload {
  action: string;
  repository: {
    name: string;
    full_name: string;
    owner: {
      login: string;
    };
  };
  workflow_run?: {
    id: number;
    name: string;
    conclusion: string | null;
    status: string;
    html_url: string;
    created_at: string;
    updated_at: string;
  };
  workflow_job?: {
    run_id: number;
    workflow_name: string;
    conclusion: string | null;
    run_url: string;
    html_url: string;
    created_at: string;
    completed_at: string;
  };
}

// ============= Failure Types =============

export interface WorkflowFailure {
  id: number;
  repo_name: string;
  owner: string;
  run_id: number;
  workflow_name: string | null;
  status: string;
  conclusion: string | null;
  error_log: string | null;
  suggested_fix: string | null;
  fix_status: string | null;
  confidence_score: number | null;
  error_category: string | null;
  fix_complexity: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FailureData {
  owner: string;
  repo: string;
  run_id: number;
  workflow_name: string;
  conclusion: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

// ============= Fix Types =============

export interface PendingFix {
  id: number;
  repo_name: string;
  owner: string;
  run_id: number;
  workflow_name: string | null;
  suggested_fix: string | null;
  fix_status: string | null;
  confidence_score: number | null;
  error_category: string | null;
  fix_complexity: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface FixStatus {
  fix_id: string;
  status: string | null;
  pr_url: string | null;
  branch_name: string | null;
  error_message: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

// ============= Gemini AI Types =============

export interface GeminiAnalysisResult {
  error_type: string;
  root_cause: string;
  severity: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  suggested_fix: {
    description: string;
    steps: string[];
    files_to_modify: Array<{
      file: string;
      changes: string;
    }>;
    commands_to_run: string[];
  };
  prevention: string;
  estimated_fix_time: string;
  risk_level: 'high' | 'medium' | 'low';
}

export interface RepoContext {
  owner?: string;
  repo?: string;
  repo_name?: string;
  run_id?: number | string;
  workflow_name?: string;
  status?: string;
  conclusion?: string;
  event?: string;
  created_at?: string;
  updated_at?: string;
  head_branch?: string;
  head_sha?: string;
  html_url?: string;
}

// ============= Analytics Types =============

export interface PatternAnalysis {
  analysis_period: string;
  total_runs: number;
  patterns: {
    most_failing_repos: Record<string, number>;
    common_error_types: Record<string, number>;
    failure_time_distribution: Record<number, number>;
    fix_success_rates: Record<string, {
      success_rate: number;
      total_fixes: number;
      approved_fixes: number;
    }>;
    language_distribution: Record<string, number>;
    total_unique_repos: number;
    total_error_types: number;
  };
  recommendations: string[];
  analyzed_at: string;
}

export interface FixEffectivenessStats {
  overall_stats: {
    total_fixes: number;
    approved_fixes: number;
    rejected_fixes: number;
    pending_fixes: number;
    approval_rate: number;
    rejection_rate: number;
    pending_rate?: number;
  };
  status_distribution: Record<string, number>;
  effectiveness_by_type: Record<string, {
    total_fixes: number;
    approval_rate: number;
    rejection_rate: number;
    pending_rate: number;
  }>;
  generated_at: string;
}

export interface RepositoryProfile {
  repository: string;
  total_runs: number;
  most_failing_workflows?: Record<string, number>;
  common_error_types?: Record<string, number>;
  recent_fixes?: Array<{
    fix_preview: string;
    status: string;
    date: string | null;
  }>;
  success_rate?: number;
  success_trend?: Array<{
    date: string | null;
    successful: boolean;
  }>;
  recommendations?: string[];
  analyzed_at?: string;
  message?: string;
  error?: string;
}

export interface DashboardData {
  overview: {
    generated_at: string;
    period: string;
  };
  failure_patterns: PatternAnalysis;
  fix_effectiveness: FixEffectivenessStats;
  key_metrics: {
    total_repos_analyzed: number;
    total_error_types: number;
    most_common_error: string;
    overall_fix_approval_rate: number;
  };
}

// ============= ML Types =============

export interface SimilarFix {
  similarity_score: number;
  historical_fix: string;
  repository: string;
  date: string | null;
  error_pattern: string;
}

export interface FixPrediction {
  predicted_success_rate: number;
  confidence: number;
  factors: Record<string, number>;
  risk_assessment: string;
  recommendations: string[];
}

export interface EnhancedFix {
  primary_solution: string;
  code_changes: Array<{
    file: string;
    change: string;
  }>;
  alternative_solutions: string[];
  implementation_steps: string[];
  estimated_effort: string;
  success_probability: number;
}

export interface LearnedPatternData {
  error_signature: string;
  fix_template: string;
  success_rate: number;
  usage_count: number;
  repo_contexts: string[];
  last_updated: string;
}

export interface PatternInsights {
  total_learned_patterns: number;
  patterns_by_success_rate: Record<string, number>;
  most_common_repos: Record<string, number>;
  pattern_age_distribution: Record<string, number>;
}

export interface ModelPerformance {
  data_summary: {
    total_fixes_last_30_days: number;
    approved_fixes: number;
    rejected_fixes: number;
    approval_rate: number;
  };
  model_status: {
    learned_patterns_count: number;
    pattern_recognition: string;
    success_prediction: string;
    intelligent_generation: string;
  };
  model_capabilities: Record<string, string>;
}

// ============= GitHub Types =============

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  event: string;
  head_branch: string;
  head_sha: string;
  repository?: {
    full_name: string;
    name: string;
  };
}

export interface GitHubWorkflowJob {
  id: number;
  run_id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
  steps?: Array<{
    name: string;
    status: string;
    conclusion: string | null;
    number: number;
  }>;
}

export interface ApplyFixResult {
  branch_name: string;
  pull_request: {
    html_url: string;
    number: number;
  } | null;
  files_changed: number;
}
