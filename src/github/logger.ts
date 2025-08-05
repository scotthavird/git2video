/**
 * Comprehensive logging and monitoring infrastructure for GitHub API integration
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  operation?: string;
  endpoint?: string;
  metadata?: Record<string, any>;
  duration?: number;
  requestId?: string;
}

export interface PerformanceMetrics {
  operationName: string;
  duration: number;
  success: boolean;
  endpoint?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface RateLimitMetrics {
  timestamp: Date;
  remaining: number;
  limit: number;
  reset: Date;
  resource: string;
}

export interface ErrorMetrics {
  timestamp: Date;
  errorType: string;
  operation: string;
  endpoint?: string;
  statusCode?: number;
  recoverable: boolean;
  attempt: number;
}

export class GitHubLogger {
  private logs: LogEntry[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private rateLimitMetrics: RateLimitMetrics[] = [];
  private errorMetrics: ErrorMetrics[] = [];
  private maxLogEntries: number = 1000;
  private logLevel: LogLevel = 'info';

  constructor(options: { maxLogEntries?: number; logLevel?: LogLevel } = {}) {
    this.maxLogEntries = options.maxLogEntries || 1000;
    this.logLevel = options.logLevel || 'info';
  }

  /**
   * Log a message with specified level
   */
  log(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    if (this.shouldLog(level)) {
      const entry: LogEntry = {
        timestamp: new Date(),
        level,
        message,
        metadata,
        requestId: this.generateRequestId(),
      };

      this.logs.push(entry);
      this.trimLogs();
      this.outputLog(entry);
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.log('debug', message, metadata);
  }

  /**
   * Info level logging
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.log('info', message, metadata);
  }

  /**
   * Warning level logging
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.log('warn', message, metadata);
  }

  /**
   * Error level logging
   */
  error(message: string, metadata?: Record<string, any>): void {
    this.log('error', message, metadata);
  }

  /**
   * Start performance tracking for an operation
   */
  startPerformanceTracking(operationName: string, endpoint?: string): PerformanceTracker {
    return new PerformanceTracker(operationName, endpoint, this);
  }

  /**
   * Record performance metrics
   */
  recordPerformance(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics);
    this.trimMetrics();

    this.info(`Performance: ${metrics.operationName} completed in ${metrics.duration}ms`, {
      operation: metrics.operationName,
      endpoint: metrics.endpoint,
      success: metrics.success,
      duration: metrics.duration,
    });
  }

  /**
   * Record rate limit metrics
   */
  recordRateLimit(metrics: RateLimitMetrics): void {
    this.rateLimitMetrics.push(metrics);
    this.trimMetrics();

    const warningThreshold = metrics.limit * 0.1; // Warn when 10% remaining
    if (metrics.remaining <= warningThreshold) {
      this.warn(`Rate limit warning: ${metrics.remaining}/${metrics.limit} remaining`, {
        resource: metrics.resource,
        resetTime: metrics.reset.toISOString(),
      });
    }

    this.debug(`Rate limit status: ${metrics.remaining}/${metrics.limit} remaining`, {
      resource: metrics.resource,
      resetTime: metrics.reset.toISOString(),
    });
  }

  /**
   * Record error metrics
   */
  recordError(metrics: ErrorMetrics): void {
    this.errorMetrics.push(metrics);
    this.trimMetrics();

    this.error(`API Error: ${metrics.errorType} in ${metrics.operation}`, {
      endpoint: metrics.endpoint,
      statusCode: metrics.statusCode,
      recoverable: metrics.recoverable,
      attempt: metrics.attempt,
    });
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(timeWindowMs: number = 3600000): {
    averageResponseTime: number;
    successRate: number;
    slowestOperations: PerformanceMetrics[];
    operationStats: Record<string, {
      count: number;
      averageTime: number;
      successRate: number;
    }>;
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentMetrics = this.performanceMetrics.filter(
      m => m.timestamp.getTime() > cutoffTime
    );

    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        successRate: 0,
        slowestOperations: [],
        operationStats: {},
      };
    }

    const totalTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const successfulOps = recentMetrics.filter(m => m.success).length;
    const averageResponseTime = totalTime / recentMetrics.length;
    const successRate = successfulOps / recentMetrics.length;

    const slowestOperations = [...recentMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const operationStats: Record<string, any> = {};
    recentMetrics.forEach(metric => {
      if (!operationStats[metric.operationName]) {
        operationStats[metric.operationName] = {
          count: 0,
          totalTime: 0,
          successes: 0,
        };
      }
      
      const stats = operationStats[metric.operationName];
      stats.count++;
      stats.totalTime += metric.duration;
      if (metric.success) stats.successes++;
    });

    // Convert to final format
    Object.keys(operationStats).forEach(op => {
      const stats = operationStats[op];
      operationStats[op] = {
        count: stats.count,
        averageTime: stats.totalTime / stats.count,
        successRate: stats.successes / stats.count,
      };
    });

    return {
      averageResponseTime,
      successRate,
      slowestOperations,
      operationStats,
    };
  }

  /**
   * Get rate limit analytics
   */
  getRateLimitAnalytics(): {
    currentStatus: RateLimitMetrics | null;
    utilizationHistory: Array<{ timestamp: Date; utilizationPercent: number }>;
    averageUtilization: number;
    peakUtilization: number;
  } {
    const currentStatus = this.rateLimitMetrics.length > 0 
      ? this.rateLimitMetrics[this.rateLimitMetrics.length - 1]
      : null;

    const utilizationHistory = this.rateLimitMetrics.map(metric => ({
      timestamp: metric.timestamp,
      utilizationPercent: ((metric.limit - metric.remaining) / metric.limit) * 100,
    }));

    const utilizations = utilizationHistory.map(h => h.utilizationPercent);
    const averageUtilization = utilizations.length > 0
      ? utilizations.reduce((sum, u) => sum + u, 0) / utilizations.length
      : 0;
    
    const peakUtilization = utilizations.length > 0 
      ? Math.max(...utilizations)
      : 0;

    return {
      currentStatus,
      utilizationHistory,
      averageUtilization,
      peakUtilization,
    };
  }

  /**
   * Get error analytics
   */
  getErrorAnalytics(timeWindowMs: number = 3600000): {
    totalErrors: number;
    errorRate: number;
    errorsByType: Record<string, number>;
    errorsByOperation: Record<string, number>;
    recoverableErrorRate: number;
    recentErrors: ErrorMetrics[];
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const recentErrors = this.errorMetrics.filter(
      e => e.timestamp.getTime() > cutoffTime
    );

    const totalOperations = this.performanceMetrics.filter(
      m => m.timestamp.getTime() > cutoffTime
    ).length;

    const errorsByType: Record<string, number> = {};
    const errorsByOperation: Record<string, number> = {};
    let recoverableErrors = 0;

    recentErrors.forEach(error => {
      errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
      errorsByOperation[error.operation] = (errorsByOperation[error.operation] || 0) + 1;
      if (error.recoverable) recoverableErrors++;
    });

    return {
      totalErrors: recentErrors.length,
      errorRate: totalOperations > 0 ? recentErrors.length / totalOperations : 0,
      errorsByType,
      errorsByOperation,
      recoverableErrorRate: recentErrors.length > 0 ? recoverableErrors / recentErrors.length : 0,
      recentErrors: recentErrors.slice(-10),
    };
  }

  /**
   * Generate comprehensive system health report
   */
  getHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    summary: string;
    metrics: {
      performance: ReturnType<GitHubLogger['getPerformanceAnalytics']>;
      rateLimit: ReturnType<GitHubLogger['getRateLimitAnalytics']>;
      errors: ReturnType<GitHubLogger['getErrorAnalytics']>;
    };
    recommendations: string[];
  } {
    const performance = this.getPerformanceAnalytics();
    const rateLimit = this.getRateLimitAnalytics();
    const errors = this.getErrorAnalytics();

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    // Check performance issues
    if (performance.averageResponseTime > 5000) {
      status = 'warning';
      recommendations.push('High average response time detected');
    }

    if (performance.successRate < 0.9) {
      status = 'warning';
      recommendations.push('Low success rate detected');
    }

    // Check rate limit issues
    if (rateLimit.averageUtilization > 80) {
      status = 'warning';
      recommendations.push('High rate limit utilization');
    }

    if (rateLimit.currentStatus && rateLimit.currentStatus.remaining < 100) {
      status = 'critical';
      recommendations.push('Rate limit critically low');
    }

    // Check error rates
    if (errors.errorRate > 0.1) {
      status = 'critical';
      recommendations.push('High error rate detected');
    } else if (errors.errorRate > 0.05) {
      status = status === 'critical' ? 'critical' : 'warning';
      recommendations.push('Elevated error rate');
    }

    const summary = this.generateHealthSummary(status, performance, rateLimit, errors);

    return {
      status,
      summary,
      metrics: { performance, rateLimit, errors },
      recommendations: recommendations.length > 0 ? recommendations : ['System operating normally'],
    };
  }

  /**
   * Export logs for external analysis
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        logs: this.logs,
        performanceMetrics: this.performanceMetrics,
        rateLimitMetrics: this.rateLimitMetrics,
        errorMetrics: this.errorMetrics,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    } else {
      // CSV format for logs
      const csvHeaders = 'timestamp,level,message,operation,endpoint,duration\n';
      const csvRows = this.logs.map(log => 
        `${log.timestamp.toISOString()},${log.level},${log.message.replace(/,/g, ';')},${log.operation || ''},${log.endpoint || ''},${log.duration || ''}`
      ).join('\n');
      return csvHeaders + csvRows;
    }
  }

  // Private methods
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private outputLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const message = `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;
    
    // Output to appropriate console method
    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.metadata);
        break;
      case 'info':
        console.info(message, entry.metadata);
        break;
      case 'warn':
        console.warn(message, entry.metadata);
        break;
      case 'error':
        console.error(message, entry.metadata);
        break;
    }
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }
  }

  private trimMetrics(): void {
    const maxMetricsEntries = this.maxLogEntries;
    
    if (this.performanceMetrics.length > maxMetricsEntries) {
      this.performanceMetrics = this.performanceMetrics.slice(-maxMetricsEntries);
    }
    
    if (this.rateLimitMetrics.length > maxMetricsEntries) {
      this.rateLimitMetrics = this.rateLimitMetrics.slice(-maxMetricsEntries);
    }
    
    if (this.errorMetrics.length > maxMetricsEntries) {
      this.errorMetrics = this.errorMetrics.slice(-maxMetricsEntries);
    }
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateHealthSummary(
    status: string,
    performance: any,
    rateLimit: any,
    errors: any
  ): string {
    const parts = [
      `System Status: ${status.toUpperCase()}`,
      `Response Time: ${Math.round(performance.averageResponseTime)}ms`,
      `Success Rate: ${Math.round(performance.successRate * 100)}%`,
      `Rate Limit: ${Math.round(rateLimit.averageUtilization)}% utilized`,
      `Error Rate: ${Math.round(errors.errorRate * 100)}%`,
    ];
    
    return parts.join(' | ');
  }
}

/**
 * Performance tracker for individual operations
 */
export class PerformanceTracker {
  private startTime: number;

  constructor(
    private operationName: string,
    private endpoint: string | undefined,
    private logger: GitHubLogger
  ) {
    this.startTime = Date.now();
  }

  /**
   * Complete tracking and record metrics
   */
  complete(success: boolean = true, metadata?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;
    
    this.logger.recordPerformance({
      operationName: this.operationName,
      duration,
      success,
      endpoint: this.endpoint,
      timestamp: new Date(),
      metadata,
    });
  }

  /**
   * Complete with error
   */
  error(error: Error, metadata?: Record<string, any>): void {
    this.complete(false, { error: error.message, ...metadata });
  }
}