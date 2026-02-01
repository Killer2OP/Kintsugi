import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiAnalysisResult, RepoContext } from '@/lib/types/index';
import { githubService } from './github';

export class GeminiFixerAgent {
  private apiKey: string | null;
  private genAI: GoogleGenerativeAI | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || null;
    this.genAI = this.apiKey ? new GoogleGenerativeAI(this.apiKey) : null;
    
    if (!this.apiKey) {
      console.warn('Warning: No Gemini API key provided. Using fallback analysis.');
    }
  }

  async analyzeFailureAndSuggestFix(
    errorLogs: string,
    repoContext: RepoContext
  ): Promise<GeminiAnalysisResult> {
    if (this.genAI) {
      return this.analyzeWithGemini(errorLogs, repoContext);
    }
    return this.analyzeWithFallback(errorLogs);
  }

  private async analyzeWithGemini(
    errorLogs: string,
    repoContext: RepoContext
  ): Promise<GeminiAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(errorLogs, repoContext);

    try {
      const model = this.genAI!.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return this.parseGeminiResponse(responseText);
    } catch (error) {
      console.error(`Error calling Gemini API: ${error}`);
      return this.analyzeWithFallback(errorLogs);
    }
  }

  async analyzeFailure(
    owner: string,
    repo: string,
    runId: number
  ): Promise<GeminiAnalysisResult | null> {
    try {
      // Fetch workflow data
      let workflowData = await githubService.getWorkflowRun(owner, repo, runId);
      if (!workflowData) {
        console.error(`Could not fetch workflow run data for ${owner}/${repo}#${runId}`);
        workflowData = {
          id: runId,
          name: 'Unknown Workflow',
          status: 'completed',
          conclusion: 'failure',
          html_url: `https://github.com/${owner}/${repo}/actions/runs/${runId}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          event: 'unknown',
          head_branch: 'main',
          head_sha: '',
        };
      }

      // Fetch logs
      let logs = await githubService.getWorkflowLogs(owner, repo, runId);
      if (!logs) {
        console.error(`Could not fetch workflow logs for ${owner}/${repo}#${runId}`);
        logs = 'Build failed with unknown error. No detailed logs available.';
      }

      // Build context
      const repoContext: RepoContext = {
        owner,
        repo,
        run_id: runId,
        workflow_name: workflowData.name || 'Unknown',
        conclusion: workflowData.conclusion || 'failure',
        event: workflowData.event || 'unknown',
        created_at: workflowData.created_at,
        head_branch: workflowData.head_branch,
        head_sha: (workflowData.head_sha || '').slice(0, 8),
      };

      console.log(`🤖 Analyzing failure with Gemini AI for ${owner}/${repo}#${runId}`);
      const analysisResult = await this.analyzeFailureAndSuggestFix(logs, repoContext);

      console.log(`✅ Analysis completed for ${owner}/${repo}#${runId}`);
      return analysisResult;
    } catch (error) {
      console.error(`Analysis failed for ${owner}/${repo}#${runId}: ${error}`);
      return null;
    }
  }

  private buildAnalysisPrompt(errorLogs: string, repoContext: RepoContext): string {
    const projectType = this.detectProjectType(errorLogs, repoContext);
    const languageHints = this.getLanguageSpecificHints(projectType);

    return `
You are an expert CI/CD engineer and DevOps specialist with deep knowledge of ${projectType} projects. 
Analyze the following failed CI/CD pipeline and provide a comprehensive, actionable fix.

## Repository Context:
- Repository: ${repoContext.repo_name || repoContext.repo || 'Unknown'}
- Owner: ${repoContext.owner || 'Unknown'}
- Workflow: ${repoContext.workflow_name || 'Unknown'}
- Status: ${repoContext.status || 'failed'}
- Run ID: ${repoContext.run_id || 'Unknown'}
- Detected Project Type: ${projectType}

## Error Logs Analysis:
\`\`\`
${errorLogs.slice(0, 4000)}
\`\`\`

## Language-Specific Context:
${languageHints}

## Required Analysis Output:

Please provide your analysis in the following JSON format:

\`\`\`json
{
    "error_type": "category of error (e.g., dependency_conflict, build_failure, test_failure, etc.)",
    "root_cause": "clear explanation of what caused the failure",
    "severity": "high|medium|low",
    "confidence": "high|medium|low",
    "suggested_fix": {
        "description": "human-readable description of the fix",
        "steps": ["step 1", "step 2"],
        "files_to_modify": [{"file": "path/to/file", "changes": "description"}],
        "commands_to_run": ["command 1", "command 2"]
    },
    "prevention": "how to prevent this issue in the future",
    "estimated_fix_time": "estimated time to implement",
    "risk_level": "low|medium|high"
}
\`\`\`

Focus on providing actionable, specific fixes.
`;
  }

  private detectProjectType(errorLogs: string, repoContext: RepoContext): string {
    const errorLogsLower = errorLogs.toLowerCase();
    const repoName = (repoContext.repo_name || repoContext.repo || '').toLowerCase();

    if (['npm', 'yarn', 'package.json', 'node_modules'].some(k => errorLogsLower.includes(k))) {
      if (errorLogsLower.includes('next') || errorLogsLower.includes('react')) return 'Next.js/React';
      if (errorLogsLower.includes('vue')) return 'Vue.js';
      if (errorLogsLower.includes('angular')) return 'Angular';
      return 'Node.js/JavaScript';
    }

    if (['pip', 'python', 'requirements.txt', 'pyproject.toml'].some(k => errorLogsLower.includes(k))) {
      if (errorLogsLower.includes('django')) return 'Django/Python';
      if (errorLogsLower.includes('flask')) return 'Flask/Python';
      if (errorLogsLower.includes('fastapi')) return 'FastAPI/Python';
      return 'Python';
    }

    if (['docker', 'dockerfile', 'container'].some(k => errorLogsLower.includes(k))) return 'Docker/Containerized';
    if (['maven', 'gradle', 'java'].some(k => errorLogsLower.includes(k))) return 'Java/JVM';
    if (['cargo', 'rust'].some(k => errorLogsLower.includes(k))) return 'Rust';
    if (['go mod', 'golang'].some(k => errorLogsLower.includes(k))) return 'Go';
    if (['.net', 'dotnet', 'csharp'].some(k => errorLogsLower.includes(k))) return '.NET/C#';

    if (['react', 'next', 'vue', 'angular'].some(t => repoName.includes(t))) return 'Frontend/JavaScript';
    if (['api', 'backend', 'server'].some(t => repoName.includes(t))) return 'Backend/API';

    return 'General';
  }

  private getLanguageSpecificHints(projectType: string): string {
    const hints: Record<string, string> = {
      'Next.js/React': `Common Next.js/React Issues:
- Node version compatibility
- Package.json dependency conflicts
- Build errors due to TypeScript configuration
- Memory issues during build`,
      'Node.js/JavaScript': `Common Node.js Issues:
- npm/yarn dependency resolution conflicts
- Node version mismatches
- Package-lock.json inconsistencies
- Missing global packages`,
      'Python': `Common Python Issues:
- Python version compatibility
- pip dependency conflicts and version pinning
- Missing system dependencies
- Virtual environment issues`,
      'Docker/Containerized': `Common Docker Issues:
- Base image availability
- COPY/ADD path issues
- Multi-stage build problems
- Resource limits`,
    };

    return hints[projectType] || `General CI/CD Issues:
- Environment variable configuration
- File permissions and path issues
- Resource constraints
- Tool version mismatches`;
  }

  private parseGeminiResponse(responseText: string): GeminiAnalysisResult {
    try {
      // Try to extract JSON from markdown code block
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      // Try parsing raw JSON
      return JSON.parse(responseText);
    } catch (error) {
      console.error(`Failed to parse Gemini response as JSON: ${error}`);
      return {
        error_type: 'unknown',
        root_cause: 'Failed to parse AI analysis',
        severity: 'medium',
        confidence: 'low',
        suggested_fix: {
          description: responseText.slice(0, 500),
          steps: ['Review the error logs manually', 'Check for common CI/CD issues'],
          files_to_modify: [],
          commands_to_run: [],
        },
        prevention: 'Implement better error handling and monitoring',
        estimated_fix_time: '30 minutes',
        risk_level: 'medium',
      };
    }
  }

  private analyzeWithFallback(errorLogs: string): GeminiAnalysisResult {
    const errorLogsLower = errorLogs.toLowerCase();

    if (errorLogsLower.includes('npm err') || errorLogsLower.includes('yarn error')) {
      return this.analyzeNpmError(errorLogs);
    }
    if (errorLogsLower.includes('docker') && (errorLogsLower.includes('build') || errorLogsLower.includes('push'))) {
      return this.analyzeDockerError();
    }
    if (errorLogsLower.includes('test') && (errorLogsLower.includes('failed') || errorLogsLower.includes('error'))) {
      return this.analyzeTestError();
    }
    if (errorLogsLower.includes('python') || errorLogsLower.includes('pip')) {
      return this.analyzePythonError();
    }
    return this.genericErrorAnalysis();
  }

  private analyzeNpmError(errorLogs: string): GeminiAnalysisResult {
    if (errorLogs.toLowerCase().includes('peer dep missing')) {
      return {
        error_type: 'dependency_conflict',
        root_cause: 'Missing peer dependency detected in npm/yarn installation',
        severity: 'medium',
        confidence: 'high',
        suggested_fix: {
          description: 'Install missing peer dependencies',
          steps: [
            'Identify the missing peer dependency from the error message',
            'Install the required peer dependency with correct version',
            'Update package.json to include the peer dependency',
          ],
          files_to_modify: [{ file: 'package.json', changes: 'Add missing peer dependency' }],
          commands_to_run: ['npm install <missing-package>@<version>', 'npm audit fix'],
        },
        prevention: 'Use npm ls --depth=0 to check for peer dependency warnings before committing',
        estimated_fix_time: '10 minutes',
        risk_level: 'low',
      };
    }
    return this.genericNpmError();
  }

  private analyzeDockerError(): GeminiAnalysisResult {
    return {
      error_type: 'docker_build_failure',
      root_cause: 'Docker build or push operation failed',
      severity: 'high',
      confidence: 'medium',
      suggested_fix: {
        description: 'Fix Docker build configuration',
        steps: [
          'Check Dockerfile syntax and commands',
          'Verify base image availability',
          'Check for file permission issues',
          'Ensure all required files are copied into the image',
        ],
        files_to_modify: [{ file: 'Dockerfile', changes: 'Review and fix Dockerfile configuration' }],
        commands_to_run: ['docker build . --no-cache', 'docker run --rm -it <image> sh'],
      },
      prevention: 'Test Docker builds locally before pushing',
      estimated_fix_time: '30 minutes',
      risk_level: 'medium',
    };
  }

  private analyzeTestError(): GeminiAnalysisResult {
    return {
      error_type: 'test_failure',
      root_cause: 'One or more tests are failing',
      severity: 'high',
      confidence: 'high',
      suggested_fix: {
        description: 'Fix failing tests',
        steps: [
          'Run tests locally to reproduce the failure',
          'Review test cases and fix the underlying code issues',
          'Update test expectations if business logic has changed',
          'Ensure test environment matches CI environment',
        ],
        files_to_modify: [],
        commands_to_run: ['npm test', 'npm run test:watch'],
      },
      prevention: 'Run full test suite before pushing changes',
      estimated_fix_time: '1 hour',
      risk_level: 'medium',
    };
  }

  private analyzePythonError(): GeminiAnalysisResult {
    return {
      error_type: 'python_dependency_error',
      root_cause: 'Python package installation or import error',
      severity: 'medium',
      confidence: 'medium',
      suggested_fix: {
        description: 'Fix Python dependency issues',
        steps: [
          'Check requirements.txt for correct package versions',
          'Verify Python version compatibility',
          'Update pip and setuptools',
          'Clear pip cache if needed',
        ],
        files_to_modify: [{ file: 'requirements.txt', changes: 'Update package versions or add missing packages' }],
        commands_to_run: ['pip install --upgrade pip', 'pip install -r requirements.txt'],
      },
      prevention: 'Use virtual environments and pin exact package versions',
      estimated_fix_time: '20 minutes',
      risk_level: 'low',
    };
  }

  private genericNpmError(): GeminiAnalysisResult {
    return {
      error_type: 'npm_build_failure',
      root_cause: 'NPM installation or build process failed',
      severity: 'medium',
      confidence: 'medium',
      suggested_fix: {
        description: 'Fix NPM build issues',
        steps: [
          'Clear npm cache: npm cache clean --force',
          'Delete node_modules and package-lock.json',
          'Reinstall dependencies: npm install',
          'Check for Node.js version compatibility',
        ],
        files_to_modify: [],
        commands_to_run: ['npm cache clean --force', 'rm -rf node_modules package-lock.json', 'npm install'],
      },
      prevention: 'Use exact Node.js and npm versions in CI',
      estimated_fix_time: '15 minutes',
      risk_level: 'low',
    };
  }

  private genericErrorAnalysis(): GeminiAnalysisResult {
    return {
      error_type: 'general_build_failure',
      root_cause: 'Build process failed - requires manual investigation',
      severity: 'medium',
      confidence: 'low',
      suggested_fix: {
        description: 'Investigate and fix build failure',
        steps: [
          'Review the complete error logs carefully',
          'Check recent code changes that might have caused the issue',
          'Verify all configuration files are correct',
          'Test the build process locally',
          'Check for environment-specific issues',
        ],
        files_to_modify: [],
        commands_to_run: ['# Run build locally to reproduce the issue', '# Check git log for recent changes'],
      },
      prevention: 'Implement comprehensive testing and code review processes',
      estimated_fix_time: '1 hour',
      risk_level: 'medium',
    };
  }
}

export const geminiAgent = new GeminiFixerAgent();
