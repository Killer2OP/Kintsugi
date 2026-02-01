// Mock data for when the database is offline
// This ensures the dashboard remains functional for demonstrations

export const mockWorkflowRuns = [
  {
    id: 1,
    repo_name: 'ci-cd-test-repo',
    owner: 'kintsugi-demo',
    run_id: 12345678901,
    workflow_name: 'Node.js CI',
    status: 'completed',
    conclusion: 'failure',
    error_log: 'npm ERR! Failed to install dependencies\nnpm ERR! peer dependency conflict: react@^18.0.0 required, but got 17.0.2',
    suggested_fix: '1. Update package.json to use compatible React version\n2. Run npm install --legacy-peer-deps\n3. Or update conflicting packages to support React 18',
    fix_status: 'pending',
    confidence_score: 0.85,
    error_category: 'dependency_error',
    fix_complexity: 'medium',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: 2,
    repo_name: 'web-app',
    owner: 'kintsugi-demo',
    run_id: 12345678902,
    workflow_name: 'Build and Test',
    status: 'completed',
    conclusion: 'failure',
    error_log: 'TypeScript error TS2339: Property "data" does not exist on type "Response"',
    suggested_fix: '1. Add proper type annotation to the response\n2. Use response.json() to parse the data\n3. Define interface for API response type',
    fix_status: 'pending',
    confidence_score: 0.92,
    error_category: 'build_failure',
    fix_complexity: 'low',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
  {
    id: 3,
    repo_name: 'python-service',
    owner: 'kintsugi-demo',
    run_id: 12345678903,
    workflow_name: 'Python Tests',
    status: 'completed',
    conclusion: 'failure',
    error_log: 'pytest: 3 passed, 2 failed\nAssertionError: Expected 200, got 404',
    suggested_fix: '1. Check API endpoint URL configuration\n2. Ensure test environment has proper routes setup\n3. Verify mock server is running before tests',
    fix_status: 'approved',
    confidence_score: 0.78,
    error_category: 'test_failure',
    fix_complexity: 'medium',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 4,
    repo_name: 'docker-service',
    owner: 'kintsugi-demo',
    run_id: 12345678904,
    workflow_name: 'Docker Build',
    status: 'completed',
    conclusion: 'failure',
    error_log: 'COPY failed: file not found in build context: package.json',
    suggested_fix: '1. Ensure package.json is not in .dockerignore\n2. Check the COPY path relative to build context\n3. Verify file exists before Docker build',
    fix_status: 'pending',
    confidence_score: 0.95,
    error_category: 'docker_error',
    fix_complexity: 'low',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
  },
  {
    id: 5,
    repo_name: 'api-gateway',
    owner: 'kintsugi-demo',
    run_id: 12345678905,
    workflow_name: 'Lint and Format',
    status: 'completed',
    conclusion: 'failure',
    error_log: 'ESLint: 12 errors found\n- no-unused-vars (5)\n- react-hooks/exhaustive-deps (4)\n- import/order (3)',
    suggested_fix: '1. Remove unused variable declarations\n2. Add missing dependencies to useEffect hooks\n3. Sort imports according to ESLint config',
    fix_status: 'rejected',
    confidence_score: 0.88,
    error_category: 'linting_error',
    fix_complexity: 'low',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: 6,
    repo_name: 'microservice-auth',
    owner: 'kintsugi-demo',
    run_id: 12345678906,
    workflow_name: 'Deploy to Staging',
    status: 'completed',
    conclusion: 'failure',
    error_log: 'Error: Deployment failed - Health check timeout after 300s',
    suggested_fix: '1. Increase health check timeout in deployment config\n2. Optimize application startup time\n3. Check for blocking operations during initialization',
    fix_status: 'pending',
    confidence_score: 0.72,
    error_category: 'deployment_error',
    fix_complexity: 'high',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
  },
  {
    id: 7,
    repo_name: 'frontend-app',
    owner: 'kintsugi-demo',
    run_id: 12345678907,
    workflow_name: 'E2E Tests',
    status: 'completed',
    conclusion: 'failure',
    error_log: 'Playwright Test: 2 failed\nTimeout waiting for selector "#submit-button"',
    suggested_fix: '1. Add explicit wait for element visibility\n2. Check if button ID matches test selector\n3. Increase test timeout for slow animations',
    fix_status: 'pending',
    confidence_score: 0.81,
    error_category: 'test_failure',
    fix_complexity: 'medium',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: 8,
    repo_name: 'backend-api',
    owner: 'kintsugi-demo',
    run_id: 12345678908,
    workflow_name: 'Integration Tests',
    status: 'completed',
    conclusion: 'failure',
    error_log: 'Connection refused: localhost:5432\nPostgreSQL connection failed',
    suggested_fix: '1. Ensure PostgreSQL service is running in CI\n2. Add database service to workflow configuration\n3. Wait for database readiness before running tests',
    fix_status: 'applied',
    confidence_score: 0.91,
    error_category: 'test_failure',
    fix_complexity: 'medium',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
];

export const mockPendingFixes = mockWorkflowRuns
  .filter(run => run.fix_status === 'pending' && run.suggested_fix)
  .map(run => ({
    ...run,
    updated_at: run.created_at,
  }));

export const mockDashboardData = {
  overview: {
    generated_at: new Date().toISOString(),
    period: 'Last 7 days',
  },
  failure_patterns: {
    analysis_period: 'Last 7 days',
    total_runs: mockWorkflowRuns.length,
    patterns: {
      most_failing_repos: {
        'kintsugi-demo/ci-cd-test-repo': 3,
        'kintsugi-demo/web-app': 2,
        'kintsugi-demo/python-service': 2,
        'kintsugi-demo/docker-service': 1,
      },
      common_error_types: {
        'test_failure': 3,
        'dependency_error': 2,
        'build_failure': 1,
        'docker_error': 1,
        'linting_error': 1,
      },
      failure_time_distribution: {
        9: 2,
        10: 3,
        14: 2,
        16: 1,
      },
      fix_success_rates: {},
      language_distribution: {
        'javascript': 4,
        'python': 2,
        'docker': 2,
      },
      total_unique_repos: 8,
      total_error_types: 5,
    },
    recommendations: [
      'Focus on stabilizing test infrastructure across repositories',
      'Address recurring dependency conflicts in JavaScript projects',
      'Enhance Docker build context validation',
    ],
    analyzed_at: new Date().toISOString(),
  },
  fix_effectiveness: {
    overall_stats: {
      total_fixes: mockWorkflowRuns.length,
      approved_fixes: 1,
      rejected_fixes: 1,
      pending_fixes: 5,
      approval_rate: 12.5,
      rejection_rate: 12.5,
      pending_rate: 62.5,
    },
    status_distribution: {
      pending: 5,
      approved: 1,
      rejected: 1,
      applied: 1,
    },
    effectiveness_by_type: {},
    generated_at: new Date().toISOString(),
  },
  key_metrics: {
    total_repos_analyzed: 8,
    total_error_types: 5,
    most_common_error: 'test_failure',
    overall_fix_approval_rate: 12.5,
  },
};

export const mockEffectivenessStats = {
  message: 'Fix effectiveness analysis completed',
  statistics: {
    overall_stats: mockDashboardData.fix_effectiveness.overall_stats,
    status_distribution: mockDashboardData.fix_effectiveness.status_distribution,
    effectiveness_by_type: {},
    generated_at: new Date().toISOString(),
  },
};

export const mockPatternAnalysis = {
  message: 'Pattern analysis completed',
  analysis: {
    analysis_period: 'Last 30 days',
    total_runs: mockWorkflowRuns.length * 4,
    patterns: mockDashboardData.failure_patterns.patterns,
    recommendations: mockDashboardData.failure_patterns.recommendations,
    analyzed_at: new Date().toISOString(),
  },
};

// Helper function to check if database is available
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    const prisma = (await import('@/lib/db/prisma')).default;
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
