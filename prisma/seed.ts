import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with demo data...')

  // Clear existing data
  await prisma.workflowRun.deleteMany()
  console.log('✅ Cleared existing workflow runs')

  // Seed demo workflow runs/failures
  const demoData = [
    {
      repoName: 'ci-cd-test-repo',
      owner: 'demo-user',
      runId: BigInt(12345678901),
      workflowName: 'Node.js CI',
      status: 'completed',
      conclusion: 'failure',
      errorLog: 'npm ERR! Failed to install dependencies\nnpm ERR! peer dependency conflict: react@^18.0.0 required, but got 17.0.2',
      suggestedFix: '1. Update package.json to use compatible React version\n2. Run npm install --legacy-peer-deps\n3. Or update conflicting packages to support React 18',
      fixStatus: 'pending',
      confidenceScore: 0.85,
      errorCategory: 'dependency_error',
      fixComplexity: 'medium',
    },
    {
      repoName: 'web-app',
      owner: 'demo-user',
      runId: BigInt(12345678902),
      workflowName: 'Build and Test',
      status: 'completed',
      conclusion: 'failure',
      errorLog: 'TypeScript error TS2339: Property "data" does not exist on type "Response"',
      suggestedFix: '1. Add proper type annotation to the response\n2. Use response.json() to parse the data\n3. Define interface for API response type',
      fixStatus: 'pending',
      confidenceScore: 0.92,
      errorCategory: 'build_failure',
      fixComplexity: 'low',
    },
    {
      repoName: 'python-service',
      owner: 'demo-user',
      runId: BigInt(12345678903),
      workflowName: 'Python Tests',
      status: 'completed',
      conclusion: 'failure',
      errorLog: 'pytest: 3 passed, 2 failed\nAssertionError: Expected 200, got 404',
      suggestedFix: '1. Check API endpoint URL configuration\n2. Ensure test environment has proper routes setup\n3. Verify mock server is running before tests',
      fixStatus: 'approved',
      confidenceScore: 0.78,
      errorCategory: 'test_failure',
      fixComplexity: 'medium',
    },
    {
      repoName: 'docker-service',
      owner: 'demo-user',
      runId: BigInt(12345678904),
      workflowName: 'Docker Build',
      status: 'completed',
      conclusion: 'failure',
      errorLog: 'COPY failed: file not found in build context: package.json',
      suggestedFix: '1. Ensure package.json is not in .dockerignore\n2. Check the COPY path relative to build context\n3. Verify file exists before Docker build',
      fixStatus: 'pending',
      confidenceScore: 0.95,
      errorCategory: 'docker_error',
      fixComplexity: 'low',
    },
    {
      repoName: 'api-gateway',
      owner: 'demo-user',
      runId: BigInt(12345678905),
      workflowName: 'Lint and Format',
      status: 'completed',
      conclusion: 'failure',
      errorLog: 'ESLint: 12 errors found\n- no-unused-vars (5)\n- react-hooks/exhaustive-deps (4)\n- import/order (3)',
      suggestedFix: '1. Remove unused variable declarations\n2. Add missing dependencies to useEffect hooks\n3. Sort imports according to ESLint config',
      fixStatus: 'rejected',
      confidenceScore: 0.88,
      errorCategory: 'linting_error',
      fixComplexity: 'low',
    },
    {
      repoName: 'microservice-auth',
      owner: 'demo-user',
      runId: BigInt(12345678906),
      workflowName: 'Deploy to Staging',
      status: 'completed',
      conclusion: 'failure',
      errorLog: 'Error: Deployment failed - Health check timeout after 300s',
      suggestedFix: '1. Increase health check timeout in deployment config\n2. Optimize application startup time\n3. Check for blocking operations during initialization',
      fixStatus: 'pending',
      confidenceScore: 0.72,
      errorCategory: 'deployment_error',
      fixComplexity: 'high',
    },
    {
      repoName: 'frontend-app',
      owner: 'demo-user',
      runId: BigInt(12345678907),
      workflowName: 'E2E Tests',
      status: 'completed',
      conclusion: 'failure',
      errorLog: 'Playwright Test: 2 failed\nTimeout waiting for selector "#submit-button"',
      suggestedFix: '1. Add explicit wait for element visibility\n2. Check if button ID matches test selector\n3. Increase test timeout for slow animations',
      fixStatus: 'pending',
      confidenceScore: 0.81,
      errorCategory: 'test_failure',
      fixComplexity: 'medium',
    },
    {
      repoName: 'backend-api',
      owner: 'demo-user',
      runId: BigInt(12345678908),
      workflowName: 'Integration Tests',
      status: 'completed',
      conclusion: 'failure',
      errorLog: 'Connection refused: localhost:5432\nPostgreSQL connection failed',
      suggestedFix: '1. Ensure PostgreSQL service is running in CI\n2. Add database service to workflow configuration\n3. Wait for database readiness before running tests',
      fixStatus: 'applied',
      confidenceScore: 0.91,
      errorCategory: 'test_failure',
      fixComplexity: 'medium',
    },
  ]

  for (const data of demoData) {
    await prisma.workflowRun.create({ data })
  }

  console.log(`✅ Created ${demoData.length} demo workflow runs`)
  console.log('🎉 Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
