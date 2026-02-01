import prisma from '@/lib/db/prisma';
import {
  PatternAnalysis,
  FixEffectivenessStats,
  RepositoryProfile,
  DashboardData,
  SimilarFix,
  FixPrediction,
  EnhancedFix,
  PatternInsights,
  ModelPerformance,
  LearnedPatternData,
} from '@/lib/types/index';
import crypto from 'crypto';

// ============= Pattern Analyzer =============

export class CICDPatternAnalyzer {
  async analyzeFailurePatterns(daysBack: number = 30): Promise<PatternAnalysis> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const runs = await prisma.workflowRun.findMany({
        where: {
          createdAt: { gte: cutoffDate },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (runs.length === 0) {
        return {
          analysis_period: `Last ${daysBack} days`,
          total_runs: 0,
          patterns: {
            most_failing_repos: {},
            common_error_types: {},
            failure_time_distribution: {},
            fix_success_rates: {},
            language_distribution: {},
            total_unique_repos: 0,
            total_error_types: 0,
          },
          recommendations: [],
          analyzed_at: new Date().toISOString(),
        };
      }

      const patterns = this.extractPatterns(runs);

      return {
        analysis_period: `Last ${daysBack} days`,
        total_runs: runs.length,
        patterns,
        recommendations: this.generateRecommendations(patterns),
        analyzed_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error analyzing failure patterns: ${error}`);
      throw error;
    }
  }

  private extractPatterns(runs: Array<{
    repoName: string;
    owner: string;
    workflowName: string | null;
    status: string;
    conclusion: string | null;
    errorLog: string | null;
    suggestedFix: string | null;
    fixStatus: string | null;
    createdAt: Date;
  }>): PatternAnalysis['patterns'] {
    const repoFailures: Record<string, number> = {};
    const errorTypes: Record<string, number> = {};
    const timePatterns: Record<number, number> = {};
    const fixSuccessRates: Record<string, { total: number; approved: number }> = {};
    const languagePatterns: Record<string, number> = {};

    for (const run of runs) {
      const repoKey = `${run.owner}/${run.repoName}`;
      repoFailures[repoKey] = (repoFailures[repoKey] || 0) + 1;

      if (run.errorLog) {
        const types = this.classifyErrorTypes(run.errorLog);
        for (const type of types) {
          errorTypes[type] = (errorTypes[type] || 0) + 1;
        }
      }

      if (run.createdAt) {
        const hour = run.createdAt.getHours();
        timePatterns[hour] = (timePatterns[hour] || 0) + 1;
      }

      if (run.suggestedFix && run.fixStatus) {
        if (!fixSuccessRates[repoKey]) {
          fixSuccessRates[repoKey] = { total: 0, approved: 0 };
        }
        fixSuccessRates[repoKey].total += 1;
        if (run.fixStatus === 'approved') {
          fixSuccessRates[repoKey].approved += 1;
        }
      }

      const language = this.detectProjectLanguage(run.repoName, run.errorLog || '');
      if (language) {
        languagePatterns[language] = (languagePatterns[language] || 0) + 1;
      }
    }

    const successRates: PatternAnalysis['patterns']['fix_success_rates'] = {};
    for (const [repo, stats] of Object.entries(fixSuccessRates)) {
      if (stats.total > 0) {
        successRates[repo] = {
          success_rate: stats.approved / stats.total,
          total_fixes: stats.total,
          approved_fixes: stats.approved,
        };
      }
    }

    return {
      most_failing_repos: this.getTopN(repoFailures, 10),
      common_error_types: this.getTopN(errorTypes, 15),
      failure_time_distribution: timePatterns,
      fix_success_rates: successRates,
      language_distribution: this.getTopN(languagePatterns, 10),
      total_unique_repos: Object.keys(repoFailures).length,
      total_error_types: Object.keys(errorTypes).length,
    };
  }

  private getTopN(obj: Record<string, number>, n: number): Record<string, number> {
    const sorted = Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);
    return Object.fromEntries(sorted);
  }

  classifyErrorTypes(errorLog: string): string[] {
    if (!errorLog) return [];

    const errorPatterns: Record<string, RegExp[]> = {
      dependency_error: [
        /npm.*install.*failed/i,
        /pip.*install.*error/i,
        /package.*not.*found/i,
        /dependency.*conflict/i,
        /peer.*dependency/i,
        /ModuleNotFoundError/i,
        /ImportError/i,
      ],
      build_failure: [
        /compilation.*failed/i,
        /build.*failed/i,
        /webpack.*error/i,
        /typescript.*error/i,
        /syntax.*error/i,
      ],
      test_failure: [
        /test.*failed/i,
        /assertion.*failed/i,
        /jest.*failed/i,
        /pytest.*failed/i,
      ],
      execution_timeout: [
        /timeout/i,
        /exceeded.*time/i,
        /job.*cancelled/i,
      ],
      docker_error: [
        /docker.*build.*failed/i,
        /dockerfile.*error/i,
        /container.*failed/i,
      ],
      linting_error: [
        /eslint.*error/i,
        /pylint.*error/i,
        /flake8.*error/i,
      ],
      deployment_error: [
        /deployment.*failed/i,
        /publish.*failed/i,
        /release.*error/i,
      ],
    };

    const detectedErrors: string[] = [];
    const errorText = errorLog.toLowerCase();

    for (const [errorType, patterns] of Object.entries(errorPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(errorText)) {
          detectedErrors.push(errorType);
          break;
        }
      }
    }

    return detectedErrors;
  }

  detectProjectLanguage(repoName: string, errorLog: string): string | null {
    const languageIndicators: Record<string, string[]> = {
      javascript: ['package.json', 'npm', 'yarn', 'node', 'webpack', 'jest', '.js', '.ts'],
      python: ['requirements.txt', 'pip', 'pytest', 'python', '.py', 'virtualenv'],
      java: ['maven', 'gradle', 'junit', '.java', 'mvn', 'pom.xml'],
      csharp: ['.net', 'dotnet', 'nuget', '.cs', 'msbuild'],
      go: ['go.mod', 'go build', '.go', 'golang'],
      rust: ['cargo', '.rs', 'rustc', 'rust'],
      ruby: ['gemfile', 'bundle', '.rb', 'rake'],
      php: ['composer', '.php', 'phpunit'],
      docker: ['dockerfile', 'docker', 'container'],
    };

    const textToAnalyze = `${repoName} ${errorLog}`.toLowerCase();

    const languageScores: Record<string, number> = {};
    for (const [language, indicators] of Object.entries(languageIndicators)) {
      const score = indicators.filter(i => textToAnalyze.includes(i)).length;
      if (score > 0) {
        languageScores[language] = score;
      }
    }

    if (Object.keys(languageScores).length > 0) {
      return Object.entries(languageScores).sort((a, b) => b[1] - a[1])[0][0];
    }

    return null;
  }

  private generateRecommendations(patterns: PatternAnalysis['patterns']): string[] {
    const recommendations: string[] = [];

    const repos = Object.entries(patterns.most_failing_repos);
    if (repos.length > 0) {
      const [topRepo, count] = repos[0];
      recommendations.push(`Focus on stabilizing ${topRepo} which has ${count} failures`);
    }

    const errors = Object.entries(patterns.common_error_types);
    if (errors.length > 0) {
      const [topError, count] = errors[0];
      recommendations.push(`Address recurring ${topError} issues (${count} occurrences)`);
    }

    const langs = Object.entries(patterns.language_distribution);
    if (langs.length > 0) {
      recommendations.push(`Enhance ${langs[0][0]} specific error detection and fix generation`);
    }

    return recommendations;
  }

  async getFixEffectivenessStats(): Promise<FixEffectivenessStats> {
    try {
      const allRuns = await prisma.workflowRun.findMany({
        where: {
          OR: [
            { suggestedFix: { not: null } },
            { fixStatus: { not: null } },
          ],
        },
      });

      const total = allRuns.length;
      const approved = allRuns.filter(r => ['approved', 'accepted', 'applied'].includes(r.fixStatus || '')).length;
      const rejected = allRuns.filter(r => ['rejected', 'declined', 'denied'].includes(r.fixStatus || '')).length;
      const pending = allRuns.filter(r => ['pending', 'suggested', 'waiting'].includes(r.fixStatus || '')).length;

      const statusCounts: Record<string, number> = {};
      for (const run of allRuns) {
        if (run.fixStatus) {
          statusCounts[run.fixStatus] = (statusCounts[run.fixStatus] || 0) + 1;
        }
      }

      return {
        overall_stats: {
          total_fixes: total,
          approved_fixes: approved,
          rejected_fixes: rejected,
          pending_fixes: pending,
          approval_rate: total > 0 ? Math.round((approved / total) * 10000) / 100 : 0,
          rejection_rate: total > 0 ? Math.round((rejected / total) * 10000) / 100 : 0,
          pending_rate: total > 0 ? Math.round((pending / total) * 10000) / 100 : 0,
        },
        status_distribution: statusCounts,
        effectiveness_by_type: {},
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error getting fix effectiveness stats: ${error}`);
      throw error;
    }
  }
}

// ============= Repository Learning System =============

export class RepositoryLearningSystem {
  async buildRepositoryProfile(owner: string, repoName: string): Promise<RepositoryProfile> {
    try {
      const runs = await prisma.workflowRun.findMany({
        where: { owner, repoName },
        orderBy: { createdAt: 'desc' },
      });

      if (runs.length === 0) {
        return {
          repository: `${owner}/${repoName}`,
          message: 'No data available for this repository',
          total_runs: 0,
        };
      }

      const analyzer = new CICDPatternAnalyzer();
      const workflowPatterns: Record<string, number> = {};
      const errorPatterns: Record<string, number> = {};
      const recentFixes: RepositoryProfile['recent_fixes'] = [];
      const successTrend: RepositoryProfile['success_trend'] = [];

      for (const run of runs) {
        if (run.conclusion === 'failure' && run.workflowName) {
          workflowPatterns[run.workflowName] = (workflowPatterns[run.workflowName] || 0) + 1;
        }

        if (run.errorLog) {
          const types = analyzer.classifyErrorTypes(run.errorLog);
          for (const type of types) {
            errorPatterns[type] = (errorPatterns[type] || 0) + 1;
          }
        }

        if (run.suggestedFix && run.fixStatus && recentFixes.length < 10) {
          recentFixes.push({
            fix_preview: run.suggestedFix.length > 100 
              ? run.suggestedFix.slice(0, 100) + '...' 
              : run.suggestedFix,
            status: run.fixStatus,
            date: run.createdAt?.toISOString() || null,
          });
        }

        if (successTrend.length < 30) {
          successTrend.push({
            date: run.createdAt?.toISOString() || null,
            successful: run.conclusion !== 'failure',
          });
        }
      }

      const successfulRuns = successTrend.filter(t => t.successful).length;
      const successRate = successTrend.length > 0 ? successfulRuns / successTrend.length : 0;

      return {
        repository: `${owner}/${repoName}`,
        total_runs: runs.length,
        most_failing_workflows: this.getTopN(workflowPatterns, 5),
        common_error_types: this.getTopN(errorPatterns, 10),
        recent_fixes: recentFixes,
        success_rate: successRate,
        success_trend: successTrend,
        recommendations: this.generateRepoRecommendations(workflowPatterns, errorPatterns, successRate),
        analyzed_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error building repository profile: ${error}`);
      throw error;
    }
  }

  private getTopN(obj: Record<string, number>, n: number): Record<string, number> {
    const sorted = Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
    return Object.fromEntries(sorted);
  }

  private generateRepoRecommendations(
    workflowPatterns: Record<string, number>,
    errorPatterns: Record<string, number>,
    successRate: number
  ): string[] {
    const recommendations: string[] = [];

    const workflows = Object.entries(workflowPatterns);
    if (workflows.length > 0) {
      const [name, count] = workflows.sort((a, b) => b[1] - a[1])[0];
      recommendations.push(`Focus on stabilizing '${name}' workflow (${count} failures)`);
    }

    const errors = Object.entries(errorPatterns);
    if (errors.length > 0) {
      const [type, count] = errors.sort((a, b) => b[1] - a[1])[0];
      recommendations.push(`Address recurring ${type} issues (${count} occurrences)`);
    }

    if (successRate < 0.7) {
      recommendations.push(
        `Success rate is ${Math.round(successRate * 100)}% - consider implementing more robust testing`
      );
    } else if (successRate > 0.9) {
      recommendations.push(
        `Excellent success rate of ${Math.round(successRate * 100)}% - consider sharing best practices`
      );
    }

    return recommendations;
  }
}

// ============= ML Pattern Recognizer =============

export class MLPatternRecognizer {
  private learnedPatterns: LearnedPatternData[] = [];
  private initialized: Promise<void>;

  constructor() {
    this.initialized = this.loadLearnedPatterns();
  }

  async ensureInitialized(): Promise<void> {
    await this.initialized;
  }

  extractErrorSignature(errorLog: string): string {
    if (!errorLog) return '';

    const normalized = errorLog.toLowerCase();
    const patterns = [
      /error:?\s*(.+?)(?:\n|$)/g,
      /failed:?\s*(.+?)(?:\n|$)/g,
      /exception:?\s*(.+?)(?:\n|$)/g,
    ];

    const extractedParts: string[] = [];
    for (const pattern of patterns) {
      const matches = normalized.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 10) {
          let part = match[1];
          part = part.replace(/\/[\w/.-]+\.\w+/g, '<file>');
          part = part.replace(/line\s+\d+/g, 'line <num>');
          part = part.replace(/\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2}/g, '<time>');
          extractedParts.push(part.trim());
        }
        if (extractedParts.length >= 5) break;
      }
      if (extractedParts.length >= 5) break;
    }

    const signatureText = extractedParts.slice(0, 5).join(' | ');
    return crypto.createHash('md5').update(signatureText).digest('hex').slice(0, 16);
  }

  calculateSimilarity(log1: string, log2: string): number {
    const words1 = new Set(log1.toLowerCase().match(/\w+/g) || []);
    const words2 = new Set(log2.toLowerCase().match(/\w+/g) || []);

    if (words1.size === 0 && words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  async findSimilarFixes(
    errorLog: string,
    repoContext: string,
    minSimilarity: number = 0.3
  ): Promise<SimilarFix[]> {
    try {
      const historicalFixes = await prisma.workflowRun.findMany({
        where: {
          suggestedFix: { not: null },
          fixStatus: 'approved',
          errorLog: { not: null },
        },
        orderBy: { createdAt: 'desc' },
        take: 500,
      });

      const similarFixes: SimilarFix[] = [];

      for (const fix of historicalFixes) {
        if (!fix.errorLog) continue;

        let similarity = this.calculateSimilarity(errorLog, fix.errorLog);
        
        // Bonus for same repo
        if (`${fix.owner}/${fix.repoName}` === repoContext) {
          similarity = Math.min(1.0, similarity + 0.2);
        }

        if (similarity >= minSimilarity) {
          similarFixes.push({
            similarity_score: similarity,
            historical_fix: fix.suggestedFix || '',
            repository: `${fix.owner}/${fix.repoName}`,
            date: fix.createdAt?.toISOString() || null,
            error_pattern: fix.errorLog.length > 200 
              ? fix.errorLog.slice(0, 200) + '...' 
              : fix.errorLog,
          });
        }
      }

      return similarFixes.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 10);
    } catch (error) {
      console.error(`Error finding similar fixes: ${error}`);
      return [];
    }
  }

  async learnFromFeedback(
    errorLog: string,
    suggestedFix: string,
    fixStatus: string,
    repoContext: string
  ): Promise<void> {
    if (!['approved', 'rejected'].includes(fixStatus)) return;

    const errorSignature = this.extractErrorSignature(errorLog);

    const existingIndex = this.learnedPatterns.findIndex(
      p => p.error_signature === errorSignature
    );

    if (existingIndex >= 0) {
      const pattern = this.learnedPatterns[existingIndex];
      pattern.usage_count += 1;
      if (!pattern.repo_contexts.includes(repoContext)) {
        pattern.repo_contexts.push(repoContext);
      }
      pattern.last_updated = new Date().toISOString();

      const weight = pattern.usage_count;
      const successValue = fixStatus === 'approved' ? 1 : 0;
      pattern.success_rate = ((pattern.success_rate * (weight - 1)) + successValue) / weight;
    } else if (fixStatus === 'approved') {
      this.learnedPatterns.push({
        error_signature: errorSignature,
        fix_template: suggestedFix,
        success_rate: 1.0,
        usage_count: 1,
        repo_contexts: [repoContext],
        last_updated: new Date().toISOString(),
      });
    }

    await this.saveLearnedPatterns();
  }

  private async saveLearnedPatterns(): Promise<void> {
    try {
      await prisma.learnedPattern.deleteMany();
      await prisma.learnedPattern.create({
        data: {
          patternsData: JSON.parse(JSON.stringify(this.learnedPatterns)),
        },
      });
    } catch (error) {
      console.error(`Error saving learned patterns: ${error}`);
    }
  }

  private async loadLearnedPatterns(): Promise<void> {
    try {
      const result = await prisma.learnedPattern.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      if (result?.patternsData) {
        this.learnedPatterns = result.patternsData as unknown as LearnedPatternData[];
      }
    } catch (error) {
      console.error(`Error loading learned patterns: ${error}`);
    }
  }

  getPatternInsights(): PatternInsights {
    const successRanges = { high: 0, medium: 0, low: 0 };
    const repoCounter: Record<string, number> = {};
    const ageDistribution = { recent: 0, moderate: 0, old: 0 };
    const now = new Date();

    for (const pattern of this.learnedPatterns) {
      if (pattern.success_rate >= 0.8) successRanges.high++;
      else if (pattern.success_rate >= 0.5) successRanges.medium++;
      else successRanges.low++;

      for (const repo of pattern.repo_contexts) {
        repoCounter[repo] = (repoCounter[repo] || 0) + 1;
      }

      const daysOld = Math.floor(
        (now.getTime() - new Date(pattern.last_updated).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysOld <= 7) ageDistribution.recent++;
      else if (daysOld <= 30) ageDistribution.moderate++;
      else ageDistribution.old++;
    }

    return {
      total_learned_patterns: this.learnedPatterns.length,
      patterns_by_success_rate: successRanges,
      most_common_repos: Object.fromEntries(
        Object.entries(repoCounter).sort((a, b) => b[1] - a[1]).slice(0, 10)
      ),
      pattern_age_distribution: ageDistribution,
    };
  }

  getLearnedPatterns(): LearnedPatternData[] {
    return this.learnedPatterns;
  }
}

// ============= Success Predictor =============

export class SuccessPredictor {
  predictFixSuccess(
    errorLog: string,
    suggestedFix: string,
    repoContext: string
  ): FixPrediction {
    const recognizer = mlRecognizer;
    // Note: This relies on the singleton being initialized already since this method is synchronous
    const signature = recognizer.extractErrorSignature(errorLog);
    const patterns = recognizer.getLearnedPatterns();

    let baseSuccessRate = 0.5;
    let confidence = 0.3;
    const factors: Record<string, number> = {};

    const matchingPattern = patterns.find(p => p.error_signature === signature);
    if (matchingPattern) {
      baseSuccessRate = matchingPattern.success_rate;
      confidence = Math.min(0.95, 0.5 + (matchingPattern.usage_count * 0.05));
      factors.pattern_match = 0.9;
      
      if (matchingPattern.repo_contexts.includes(repoContext)) {
        baseSuccessRate = Math.min(1.0, baseSuccessRate + 0.1);
        factors.repo_context = 0.95;
      }
    }

    const fixLength = suggestedFix.length;
    if (fixLength < 200) {
      factors.fix_complexity = 0.8;
    } else if (fixLength < 500) {
      factors.fix_complexity = 0.6;
    } else {
      factors.fix_complexity = 0.4;
    }

    const riskAssessment = baseSuccessRate > 0.7 ? 'low' : baseSuccessRate > 0.4 ? 'medium' : 'high';

    return {
      predicted_success_rate: Math.round(baseSuccessRate * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      factors,
      risk_assessment: riskAssessment,
      recommendations: this.generatePredictionRecommendations(baseSuccessRate, factors),
    };
  }

  private generatePredictionRecommendations(successRate: number, factors: Record<string, number>): string[] {
    const recommendations: string[] = [];

    if (successRate > 0.8) {
      recommendations.push('High confidence fix - proceed with implementation');
    } else if (successRate > 0.5) {
      recommendations.push('Moderate confidence - review fix before applying');
    } else {
      recommendations.push('Low confidence - consider manual review');
    }

    if (factors.pattern_match) {
      recommendations.push('Similar fixes have been successful in the past');
    }

    return recommendations;
  }
}

// ============= Intelligent Fix Generator =============

export class IntelligentFixGenerator {
  async generateEnhancedFix(
    errorLog: string,
    repoContext: string,
    baseFix?: string
  ): Promise<EnhancedFix> {
    const recognizer = mlRecognizer;
    await recognizer.ensureInitialized();
    const similarFixes = await recognizer.findSimilarFixes(errorLog, repoContext, 0.2);

    let primarySolution = baseFix || 'Manual review required';
    const alternativeSolutions: string[] = [];

    for (const fix of similarFixes.slice(0, 3)) {
      if (fix.similarity_score > 0.5 && !baseFix) {
        primarySolution = fix.historical_fix;
      } else {
        alternativeSolutions.push(
          `From ${fix.repository} (${Math.round(fix.similarity_score * 100)}% similar): ${fix.historical_fix.slice(0, 100)}...`
        );
      }
    }

    return {
      primary_solution: primarySolution,
      code_changes: [],
      alternative_solutions: alternativeSolutions.slice(0, 3),
      implementation_steps: [
        'Review the suggested fix',
        'Test locally before applying',
        'Create a branch for the fix',
        'Apply and verify the fix',
      ],
      estimated_effort: similarFixes.length > 2 ? '15-30 minutes' : '30-60 minutes',
      success_probability: similarFixes.length > 0 
        ? Math.round(similarFixes[0].similarity_score * 100) / 100 
        : 0.5,
    };
  }
}

// ============= Dashboard Generator =============

export async function generateDashboard(): Promise<DashboardData> {
  const analyzer = new CICDPatternAnalyzer();
  
  const patterns = await analyzer.analyzeFailurePatterns(7);
  const effectiveness = await analyzer.getFixEffectivenessStats();

  const errorTypes = Object.keys(patterns.patterns.common_error_types);

  return {
    overview: {
      generated_at: new Date().toISOString(),
      period: 'Last 7 days',
    },
    failure_patterns: patterns,
    fix_effectiveness: effectiveness,
    key_metrics: {
      total_repos_analyzed: patterns.patterns.total_unique_repos,
      total_error_types: patterns.patterns.total_error_types,
      most_common_error: errorTypes.length > 0 ? errorTypes[0] : 'No data',
      overall_fix_approval_rate: effectiveness.overall_stats.approval_rate,
    },
  };
}

// ============= Model Performance =============

export async function getModelPerformance(): Promise<ModelPerformance> {
  const recognizer = mlRecognizer;
  await recognizer.ensureInitialized();
  const patterns = recognizer.getLearnedPatterns();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRuns = await prisma.workflowRun.findMany({
    where: {
      suggestedFix: { not: null },
      createdAt: { gte: thirtyDaysAgo },
    },
  });

  const total = recentRuns.length;
  const approved = recentRuns.filter(r => r.fixStatus === 'approved').length;
  const rejected = recentRuns.filter(r => r.fixStatus === 'rejected').length;

  return {
    data_summary: {
      total_fixes_last_30_days: total,
      approved_fixes: approved,
      rejected_fixes: rejected,
      approval_rate: total > 0 ? Math.round((approved / total) * 100) / 100 : 0,
    },
    model_status: {
      learned_patterns_count: patterns.length,
      pattern_recognition: patterns.length > 0 ? 'Active' : 'Learning',
      success_prediction: 'Available',
      intelligent_generation: 'Available',
    },
    model_capabilities: {
      similarity_matching: '✅ Operational',
      success_prediction: '✅ Operational',
      pattern_learning: '✅ Operational',
      adaptive_improvement: '✅ Operational',
    },
  };
}

// Export singleton instances
export const patternAnalyzer = new CICDPatternAnalyzer();
export const repoLearning = new RepositoryLearningSystem();
export const mlRecognizer = new MLPatternRecognizer();
export const successPredictor = new SuccessPredictor();
export const fixGenerator = new IntelligentFixGenerator();
