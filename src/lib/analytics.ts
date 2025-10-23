/**
 * Analytics & Telemetry System
 * Captures performance metrics and user interactions for Canvas Mode
 * Tracks: Undo/redo latency, AI call timing, transform operations, breakpoint switches
 */

export interface AnalyticsEvent {
  category: 'performance' | 'user_action' | 'ai' | 'error';
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  undoLatency: number[];
  redoLatency: number[];
  aiCallDuration: number[];
  transformLatency: number[];
  breakpointSwitchLatency: number[];
  cssInjectionLatency: number[];
}

class AnalyticsService {
  private sessionId: string;
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetrics = {
    undoLatency: [],
    redoLatency: [],
    aiCallDuration: [],
    transformLatency: [],
    breakpointSwitchLatency: [],
    cssInjectionLatency: [],
  };
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();

    // Log session start
    this.track({
      category: 'user_action',
      action: 'session_start',
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });

    // Flush events periodically
    if (typeof window !== 'undefined') {
      setInterval(() => this.flush(), 30000); // Flush every 30 seconds

      // Flush on page unload
      window.addEventListener('beforeunload', () => this.flush());
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track analytics event
   */
  track(event: Omit<AnalyticsEvent, 'sessionId' | 'timestamp'>): void {
    if (!this.isEnabled) return;

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(fullEvent);

    // Console log in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics:', fullEvent);
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: keyof PerformanceMetrics, value: number): void {
    if (!this.isEnabled) return;

    this.metrics[metric].push(value);

    // Track as event
    this.track({
      category: 'performance',
      action: metric,
      value,
    });

    // Warn if performance threshold exceeded
    this.checkPerformanceThresholds(metric, value);
  }

  /**
   * Measure operation timing
   */
  measureOperation<T>(
    operation: () => T,
    metric: keyof PerformanceMetrics,
    label?: string
  ): T {
    const start = performance.now();
    try {
      const result = operation();
      const duration = performance.now() - start;

      this.trackPerformance(metric, duration);

      if (label) {
        this.track({
          category: 'performance',
          action: `${metric}_labeled`,
          label,
          value: duration,
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.track({
        category: 'error',
        action: `${metric}_error`,
        label: error instanceof Error ? error.message : 'Unknown error',
        value: duration,
      });

      throw error;
    }
  }

  /**
   * Measure async operation timing
   */
  async measureAsyncOperation<T>(
    operation: () => Promise<T>,
    metric: keyof PerformanceMetrics,
    label?: string
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;

      this.trackPerformance(metric, duration);

      if (label) {
        this.track({
          category: 'performance',
          action: `${metric}_labeled`,
          label,
          value: duration,
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      this.track({
        category: 'error',
        action: `${metric}_error`,
        label: error instanceof Error ? error.message : 'Unknown error',
        value: duration,
      });

      throw error;
    }
  }

  /**
   * Check performance thresholds and warn
   */
  private checkPerformanceThresholds(metric: keyof PerformanceMetrics, value: number): void {
    const thresholds: Record<keyof PerformanceMetrics, number> = {
      undoLatency: 100, // 100ms
      redoLatency: 100, // 100ms
      aiCallDuration: 20000, // 20 seconds
      transformLatency: 50, // 50ms
      breakpointSwitchLatency: 500, // 500ms
      cssInjectionLatency: 16, // 16ms for 60fps
    };

    if (value > thresholds[metric]) {
      console.warn(
        `⚠️ Performance threshold exceeded for ${metric}: ${value.toFixed(2)}ms (threshold: ${thresholds[metric]}ms)`
      );

      this.track({
        category: 'performance',
        action: 'threshold_exceeded',
        label: metric,
        value,
        metadata: {
          threshold: thresholds[metric],
          exceeded: value - thresholds[metric],
        },
      });
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<keyof PerformanceMetrics, { avg: number; min: number; max: number; count: number }> {
    const summary: any = {};

    for (const [key, values] of Object.entries(this.metrics)) {
      if (values.length === 0) {
        summary[key] = { avg: 0, min: 0, max: 0, count: 0 };
        continue;
      }

      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      summary[key] = { avg, min, max, count: values.length };
    }

    return summary;
  }

  /**
   * Flush events to console or analytics endpoint
   */
  flush(): void {
    if (this.events.length === 0) return;

    const payload = {
      events: this.events,
      metrics: this.getPerformanceSummary(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    // In production, send to analytics endpoint
    const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
    if (!import.meta.env.DEV && analyticsEndpoint) {
      fetch(analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Don't await - fire and forget
      }).catch((error) => {
        console.error('Analytics flush failed:', error);
      });
    }

    // Log summary in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Summary:', {
        eventCount: this.events.length,
        sessionId: this.sessionId,
        performance: this.getPerformanceSummary(),
      });
    }

    // Clear events after flush
    this.events = [];
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Reset session (useful for testing)
   */
  resetSession(): void {
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.metrics = {
      undoLatency: [],
      redoLatency: [],
      aiCallDuration: [],
      transformLatency: [],
      breakpointSwitchLatency: [],
      cssInjectionLatency: [],
    };

    this.track({
      category: 'user_action',
      action: 'session_reset',
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

/**
 * Convenience functions for common tracking scenarios
 */

export function trackUndo(duration: number): void {
  analytics.trackPerformance('undoLatency', duration);
}

export function trackRedo(duration: number): void {
  analytics.trackPerformance('redoLatency', duration);
}

export function trackAICall(duration: number, success: boolean, provider?: string): void {
  analytics.trackPerformance('aiCallDuration', duration);
  analytics.track({
    category: 'ai',
    action: success ? 'call_success' : 'call_failure',
    label: provider,
    value: duration,
  });
}

export function trackTransform(duration: number, type: 'move' | 'resize' | 'rotate'): void {
  analytics.trackPerformance('transformLatency', duration);
  analytics.track({
    category: 'user_action',
    action: 'transform',
    label: type,
    value: duration,
  });
}

export function trackBreakpointSwitch(duration: number, from: string, to: string): void {
  analytics.trackPerformance('breakpointSwitchLatency', duration);
  analytics.track({
    category: 'user_action',
    action: 'breakpoint_switch',
    label: `${from} → ${to}`,
    value: duration,
  });
}

export function trackCSSInjection(duration: number, elementCount: number): void {
  analytics.trackPerformance('cssInjectionLatency', duration);
  analytics.track({
    category: 'performance',
    action: 'css_injection',
    value: duration,
    metadata: { elementCount },
  });
}

export function trackError(error: Error, context?: string): void {
  analytics.track({
    category: 'error',
    action: 'error_occurred',
    label: context || 'unknown',
    metadata: {
      message: error.message,
      stack: error.stack,
    },
  });
}

export function trackUserAction(action: string, label?: string, value?: number): void {
  analytics.track({
    category: 'user_action',
    action,
    label,
    value,
  });
}
