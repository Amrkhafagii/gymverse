/**
 * Retry logic manager with exponential backoff
 * Handles intelligent retry scheduling for failed operations
 */

export interface RetryConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  maxRetries: number;
}

export interface RetryAttempt {
  attemptNumber: number;
  delayMs: number;
  scheduledAt: Date;
  error?: string;
}

export class RetryManager {
  private config: RetryConfig;
  private retryHistory: Map<string, RetryAttempt[]> = new Map();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      baseDelayMs: 1000, // 1 second
      maxDelayMs: 300000, // 5 minutes
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      maxRetries: 5,
      ...config
    };
  }

  calculateRetryDelay(attemptNumber: number, baseDelay?: number): number {
    const base = baseDelay || this.config.baseDelayMs;
    
    // Exponential backoff: delay = base * (multiplier ^ attempt)
    let delay = base * Math.pow(this.config.backoffMultiplier, attemptNumber - 1);
    
    // Apply jitter to prevent thundering herd
    const jitter = delay * this.config.jitterFactor * (Math.random() - 0.5);
    delay += jitter;
    
    // Cap at maximum delay
    delay = Math.min(delay, this.config.maxDelayMs);
    
    return Math.round(delay);
  }

  shouldRetry(attemptNumber: number, error?: any): boolean {
    if (attemptNumber >= this.config.maxRetries) {
      return false;
    }

    // Don't retry certain types of errors
    if (error) {
      const errorMessage = error.message || error.toString();
      
      // Permanent failures that shouldn't be retried
      const permanentErrors = [
        'unauthorized',
        'forbidden',
        'not found',
        'bad request',
        'validation error',
        'invalid credentials'
      ];
      
      if (permanentErrors.some(err => errorMessage.toLowerCase().includes(err))) {
        return false;
      }
    }

    return true;
  }

  recordRetryAttempt(operationId: string, attemptNumber: number, error?: string): void {
    if (!this.retryHistory.has(operationId)) {
      this.retryHistory.set(operationId, []);
    }

    const attempts = this.retryHistory.get(operationId)!;
    const delay = this.calculateRetryDelay(attemptNumber);
    
    attempts.push({
      attemptNumber,
      delayMs: delay,
      scheduledAt: new Date(Date.now() + delay),
      error
    });

    // Keep only recent attempts to prevent memory leaks
    if (attempts.length > 10) {
      attempts.splice(0, attempts.length - 10);
    }
  }

  getRetryHistory(operationId: string): RetryAttempt[] {
    return this.retryHistory.get(operationId) || [];
  }

  clearRetryHistory(operationId: string): void {
    this.retryHistory.delete(operationId);
  }

  getRetryStatistics(): {
    totalOperations: number;
    averageAttempts: number;
    successRate: number;
    mostCommonErrors: string[];
  } {
    const allAttempts = Array.from(this.retryHistory.values()).flat();
    const totalOperations = this.retryHistory.size;
    
    if (totalOperations === 0) {
      return {
        totalOperations: 0,
        averageAttempts: 0,
        successRate: 0,
        mostCommonErrors: []
      };
    }

    const averageAttempts = allAttempts.length / totalOperations;
    
    // Calculate success rate (operations that eventually succeeded)
    const successfulOperations = Array.from(this.retryHistory.values())
      .filter(attempts => attempts.length > 0 && !attempts[attempts.length - 1].error).length;
    const successRate = successfulOperations / totalOperations;

    // Find most common errors
    const errorCounts = new Map<string, number>();
    allAttempts.forEach(attempt => {
      if (attempt.error) {
        const count = errorCounts.get(attempt.error) || 0;
        errorCounts.set(attempt.error, count + 1);
      }
    });

    const mostCommonErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error]) => error);

    return {
      totalOperations,
      averageAttempts,
      successRate,
      mostCommonErrors
    };
  }

  // Adaptive retry configuration based on network conditions
  adaptConfigForNetworkConditions(networkQuality: 'poor' | 'fair' | 'good'): void {
    switch (networkQuality) {
      case 'poor':
        this.config.baseDelayMs = 5000; // 5 seconds
        this.config.maxDelayMs = 600000; // 10 minutes
        this.config.backoffMultiplier = 2.5;
        this.config.maxRetries = 8;
        break;
      
      case 'fair':
        this.config.baseDelayMs = 2000; // 2 seconds
        this.config.maxDelayMs = 300000; // 5 minutes
        this.config.backoffMultiplier = 2;
        this.config.maxRetries = 5;
        break;
      
      case 'good':
        this.config.baseDelayMs = 1000; // 1 second
        this.config.maxDelayMs = 120000; // 2 minutes
        this.config.backoffMultiplier = 1.5;
        this.config.maxRetries = 3;
        break;
    }
  }

  // Circuit breaker pattern for failing services
  private circuitBreakerState: Map<string, {
    failures: number;
    lastFailure: Date;
    state: 'closed' | 'open' | 'half-open';
  }> = new Map();

  shouldAllowRequest(serviceId: string): boolean {
    const circuit = this.circuitBreakerState.get(serviceId);
    
    if (!circuit) {
      return true; // No history, allow request
    }

    const now = new Date();
    const timeSinceLastFailure = now.getTime() - circuit.lastFailure.getTime();
    
    switch (circuit.state) {
      case 'closed':
        return true;
      
      case 'open':
        // Check if enough time has passed to try again
        if (timeSinceLastFailure > this.config.maxDelayMs) {
          circuit.state = 'half-open';
          return true;
        }
        return false;
      
      case 'half-open':
        return true; // Allow one request to test
      
      default:
        return true;
    }
  }

  recordServiceResult(serviceId: string, success: boolean): void {
    let circuit = this.circuitBreakerState.get(serviceId);
    
    if (!circuit) {
      circuit = { failures: 0, lastFailure: new Date(), state: 'closed' };
      this.circuitBreakerState.set(serviceId, circuit);
    }

    if (success) {
      // Reset on success
      circuit.failures = 0;
      circuit.state = 'closed';
    } else {
      // Increment failures
      circuit.failures++;
      circuit.lastFailure = new Date();
      
      // Open circuit if too many failures
      if (circuit.failures >= 5) {
        circuit.state = 'open';
      }
    }
  }

  getCircuitBreakerStatus(serviceId: string): string {
    const circuit = this.circuitBreakerState.get(serviceId);
    return circuit?.state || 'closed';
  }
}
