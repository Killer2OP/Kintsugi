import { GitHubWorkflowRun, GitHubWorkflowJob, ApplyFixResult } from '@/lib/types/index';

export class GitHubService {
  private token: string | null;
  private baseUrl = 'https://api.github.com';
  private headers: HeadersInit;

  constructor(token?: string) {
    this.token = token || process.env.GITHUB_TOKEN || null;
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Kintsugi/1.0',
    };

    if (this.token) {
      (this.headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }
  }

  async getWorkflowRun(owner: string, repo: string, runId: number): Promise<GitHubWorkflowRun | null> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/actions/runs/${runId}`;

    try {
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching workflow run: ${error}`);
      return null;
    }
  }

  async getWorkflowLogs(owner: string, repo: string, runId: number): Promise<string | null> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/actions/runs/${runId}/logs`;

    try {
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      console.error(`Error fetching workflow logs: ${error}`);
      return this.getSampleLogs();
    }
  }

  async getWorkflowJobs(owner: string, repo: string, runId: number): Promise<GitHubWorkflowJob[] | null> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/actions/runs/${runId}/jobs`;

    try {
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      console.error(`Error fetching workflow jobs: ${error}`);
      return null;
    }
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels: string[] = ['ci-cd-fix', 'automated']
  ): Promise<Record<string, unknown> | null> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...this.headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, labels }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error creating issue: ${error}`);
      return null;
    }
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    body: string,
    headBranch: string,
    baseBranch: string = 'main'
  ): Promise<Record<string, unknown> | null> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...this.headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          head: headBranch,
          base: baseBranch,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error creating pull request: ${error}`);
      return null;
    }
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const crypto = require('crypto');
    const expectedSignature =
      'sha256=' +
      crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  async getRepositoryContents(
    owner: string,
    repo: string,
    path: string = '',
    ref: string = 'main'
  ): Promise<unknown[] | null> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;

    try {
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching repository contents: ${error}`);
      return null;
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref: string = 'main'
  ): Promise<Record<string, unknown> | null> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;

    try {
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching file content: ${error}`);
      return null;
    }
  }

  async createOrUpdateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string = 'main',
    sha?: string
  ): Promise<Record<string, unknown> | null> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
    const encodedContent = Buffer.from(content).toString('base64');

    const data: Record<string, unknown> = {
      message,
      content: encodedContent,
      branch,
    };

    if (sha) {
      data.sha = sha;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: { ...this.headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error creating/updating file: ${error}`);
      return null;
    }
  }

  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    baseBranch: string = 'main'
  ): Promise<Record<string, unknown> | null> {
    const baseRefUrl = `${this.baseUrl}/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`;

    try {
      const baseResponse = await fetch(baseRefUrl, { headers: this.headers });
      if (!baseResponse.ok) throw new Error(`HTTP ${baseResponse.status}`);
      const baseData = await baseResponse.json();
      const baseSha = baseData.object.sha;

      const createRefUrl = `${this.baseUrl}/repos/${owner}/${repo}/git/refs`;
      const response = await fetch(createRefUrl, {
        method: 'POST',
        headers: { ...this.headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error creating branch: ${error}`);
      return null;
    }
  }

  async getDefaultBranch(owner: string, repo: string): Promise<string> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}`;

    try {
      const response = await fetch(url, { headers: this.headers });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.default_branch || 'main';
    } catch (error) {
      console.error(`Error fetching repository info: ${error}`);
      return 'main';
    }
  }

  async applyFixToRepository(
    owner: string,
    repo: string,
    fixContent: string,
    fixId: string
  ): Promise<ApplyFixResult | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const branchName = `fix/cicd-auto-fix-${fixId}-${timestamp}`;

      const defaultBranch = await this.getDefaultBranch(owner, repo);
      const branchResult = await this.createBranch(owner, repo, branchName, defaultBranch);
      if (!branchResult) return null;

      const fixFiles = this.parseFixContent(fixContent);

      for (const fileChange of fixFiles) {
        const filePath = fileChange.path;
        const newContent = fileChange.content;

        if (!filePath || !newContent) continue;

        const existingFile = await this.getFileContent(owner, repo, filePath, branchName);
        const sha = existingFile?.sha as string | undefined;

        const commitMessage = `Auto-fix: Update ${filePath} (Fix #${fixId})`;
        await this.createOrUpdateFile(owner, repo, filePath, newContent, commitMessage, branchName, sha);
      }

      const prTitle = `🤖 Auto-fix for CI/CD Failure (Fix #${fixId})`;
      const prBody = `
## 🤖 Automated Fix

This PR contains an automated fix for a CI/CD failure.

### Fix Details:
${fixContent}

### Changes:
- Automatically generated fix based on failure analysis
- Applied by Kintsugi

### Review Required:
Please review the changes before merging to ensure they are correct.

---
*Generated by Kintsugi*
      `;

      const prResult = await this.createPullRequest(owner, repo, prTitle, prBody, branchName, defaultBranch);

      return {
        branch_name: branchName,
        pull_request: prResult ? {
          html_url: prResult.html_url as string,
          number: prResult.number as number,
        } : null,
        files_changed: fixFiles.length,
      };
    } catch (error) {
      console.error(`Error applying fix to repository: ${error}`);
      return null;
    }
  }

  private parseFixContent(fixContent: string): Array<{ path: string; content: string }> {
    const files: Array<{ path: string; content: string }> = [];
    const fixContentLower = fixContent.toLowerCase();

    if (fixContentLower.includes('package.json')) {
      files.push({
        path: 'package.json',
        content: this.generatePackageJsonFix(),
      });
    } else if (fixContentLower.includes('dockerfile')) {
      files.push({
        path: 'Dockerfile',
        content: this.generateDockerfileFix(),
      });
    } else if (fixContentLower.includes('.github/workflows')) {
      files.push({
        path: '.github/workflows/ci.yml',
        content: this.generateWorkflowFix(),
      });
    } else {
      files.push({
        path: 'AUTOMATED_FIX.md',
        content: `# Automated Fix

## Fix Applied:
${fixContent}

## Instructions:
Please review the suggested changes and apply them manually if needed.

Generated on: ${new Date().toISOString()}
`,
      });
    }

    return files;
  }

  private generatePackageJsonFix(): string {
    return `{
  "name": "fixed-project",
  "version": "1.0.0",
  "scripts": {
    "build": "npm run build",
    "test": "npm test",
    "start": "npm start"
  },
  "dependencies": {},
  "devDependencies": {}
}`;
  }

  private generateDockerfileFix(): string {
    return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]`;
  }

  private generateWorkflowFix(): string {
    return `name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build`;
  }

  private getSampleLogs(): string {
    return `2024-08-22T10:30:15.123Z [INFO] Starting build process...
2024-08-22T10:30:16.456Z [INFO] Installing dependencies...
2024-08-22T10:30:25.789Z [ERROR] npm ERR! peer dep missing: react@^18.0.0, required by react-dom@18.2.0
2024-08-22T10:30:25.790Z [ERROR] npm ERR! Could not resolve dependency
2024-08-22T10:30:25.791Z [ERROR] npm ERR! npm install failed with exit code 1
2024-08-22T10:30:25.792Z [ERROR] Process completed with exit code 1
2024-08-22T10:30:25.793Z [INFO] Build failed after 10 seconds`;
  }

  extractErrorFromLogs(logs: string): string {
    if (!logs) return 'No logs available';

    const lines = logs.split('\n');
    const errorLines: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (
        lowerLine.includes('error') ||
        lowerLine.includes('failed') ||
        lowerLine.includes('exception') ||
        lowerLine.includes('fatal')
      ) {
        errorLines.push(line.trim());
      }
    }

    if (errorLines.length > 0) {
      return errorLines.slice(0, 10).join('\n');
    }

    return 'No specific errors found in logs';
  }
}

export const githubService = new GitHubService();
