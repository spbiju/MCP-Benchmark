/**
 * Unified telemetry implementation using HTTP OTLP exports
 * Works in both Node.js and Cloudflare Workers environments
 */

import { VERSION_INFO } from '../version.js';

// OTLP Protocol Types
interface OTLPResource {
  attributes: Array<{ key: string; value: { stringValue?: string; intValue?: number } }>;
}

interface OTLPLogRecord {
  timeUnixNano: string;
  severityNumber: number;
  severityText: string;
  body: { stringValue: string };
  attributes: Array<{ key: string; value: { stringValue?: string; intValue?: number } }>;
}

interface OTLPMetricDataPoint {
  timeUnixNano: string;
  asInt?: number;
  asDouble?: number;
  attributes: Array<{ key: string; value: { stringValue: string } }>;
}

interface OTLPMetric {
  name: string;
  description: string;
  unit?: string;
  sum?: {
    dataPoints: OTLPMetricDataPoint[];
    aggregationTemporality: number;
    isMonotonic: boolean;
  };
  gauge?: {
    dataPoints: Array<{
      timeUnixNano: string;
      asDouble: number;
      attributes: Array<{ key: string; value: { stringValue: string } }>;
    }>;
  };
  histogram?: {
    dataPoints: Array<{
      timeUnixNano: string;
      count: number;
      sum: number;
      bucketCounts: number[];
      explicitBounds: number[];
      attributes: Array<{ key: string; value: { stringValue: string } }>;
    }>;
    aggregationTemporality: number;
  };
}

// Configuration
interface TelemetryConfig {
  endpoint: string;
  serviceName: string;
  serviceVersion: string;
  headers: Record<string, string>;
  timeout: number;
}

const defaultConfig: TelemetryConfig = {
  endpoint: 'https://log.api.jinko.so',
  serviceName: VERSION_INFO.name,
  serviceVersion: VERSION_INFO.version,
  headers: {},
  timeout: 10000,
};

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Unified Logger
export class UnifiedLogger {
  private config: TelemetryConfig;
  private resource: OTLPResource;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.resource = {
      attributes: [
        { key: 'service.name', value: { stringValue: this.config.serviceName } },
        { key: 'service.version', value: { stringValue: this.config.serviceVersion } },
        { key: 'telemetry.sdk.name', value: { stringValue: 'jinko-mcp-unified' } },
        { key: 'telemetry.sdk.version', value: { stringValue: this.config.serviceVersion } },
      ],
    };
  }

  private getSeverityNumber(level: LogLevel): number {
    switch (level) {
      case LogLevel.DEBUG: return 5;
      case LogLevel.INFO: return 9;
      case LogLevel.WARN: return 13;
      case LogLevel.ERROR: return 17;
      default: return 9;
    }
  }

  private createLogRecord(level: LogLevel, message: string, attributes: Record<string, any> = {}): OTLPLogRecord {
    const now = Date.now() * 1000000; // Convert to nanoseconds
    
    const otlpAttributes = Object.entries(attributes).map(([key, value]) => ({
      key,
      value: typeof value === 'string' 
        ? { stringValue: value }
        : { stringValue: String(value) }
    }));

    return {
      timeUnixNano: now.toString(),
      severityNumber: this.getSeverityNumber(level),
      severityText: level.toUpperCase(),
      body: { stringValue: message },
      attributes: otlpAttributes,
    };
  }

  private async sendLogs(logRecords: OTLPLogRecord[]): Promise<void> {
    const payload = {
      resourceLogs: [{
        resource: this.resource,
        scopeLogs: [{
          scope: {
            name: 'jinko-mcp-logger',
            version: this.config.serviceVersion,
          },
          logRecords,
        }],
      }],
    };

    try {
      const response = await fetch(`${this.config.endpoint}/v1/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Failed to send logs: ${response.status} ${response.statusText}`);
      } else {
        console.error(`Logs sent successfully: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending logs to OTLP collector:', error);
    }
  }

  async log(level: LogLevel, message: string, attributes: Record<string, any> = {}): Promise<void> {
    // Always log to console for immediate feedback
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: this.config.serviceName,
      version: this.config.serviceVersion,
      message,
      ...attributes,
    };

    // Send to OTLP collector
    const logRecord = this.createLogRecord(level, message, attributes);
    await this.sendLogs([logRecord]);
  }

  async debug(message: string, attributes: Record<string, any> = {}): Promise<void> {
    await this.log(LogLevel.DEBUG, message, attributes);
  }

  async info(message: string, attributes: Record<string, any> = {}): Promise<void> {
    await this.log(LogLevel.INFO, message, attributes);
  }

  async warn(message: string, attributes: Record<string, any> = {}): Promise<void> {
    await this.log(LogLevel.WARN, message, attributes);
  }

  async error(message: string, attributes: Record<string, any> = {}): Promise<void> {
    await this.log(LogLevel.ERROR, message, attributes);
  }

  // Convenience methods for MCP operations
  async logToolCall(toolName: string, params: any, message: string = 'Tool called'): Promise<void> {
    await this.info(message, {
      operation: 'tool_call',
      toolName,
      params: this.sanitizeParams(params),
    });
  }

  async logToolResult(toolName: string, duration: number, status: string, message: string = 'Tool completed'): Promise<void> {
    await this.info(message, {
      operation: 'tool_result',
      toolName,
      duration,
      status,
    });
  }

  async logApiCall(endpoint: string, method: string, message: string = 'API call started'): Promise<void> {
    await this.info(message, {
      operation: 'api_call_start',
      endpoint: this.sanitizeEndpoint(endpoint),
      method,
    });
  }

  async logApiResult(endpoint: string, method: string, duration: number, status: number, message?: string): Promise<void> {
    const logMessage = message || `API call completed: ${status}`;
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    
    await this.log(level, logMessage, {
      operation: 'api_call_result',
      endpoint: this.sanitizeEndpoint(endpoint),
      method,
      duration,
      status,
    });
  }

  async logError(error: Error, context: Record<string, any> = {}): Promise<void> {
    await this.error(error.message, {
      error_name: error.name,
      error_stack: error.stack,
      ...context,
    });
  }

  private sanitizeParams(params: any): any {
    if (!params) return {};
    
    const sanitized = { ...params };
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  private sanitizeEndpoint(endpoint: string): string {
    try {
      const url = new URL(endpoint);
      return `${url.protocol}//${url.host}${url.pathname}`;
    } catch {
      return endpoint.split('?')[0];
    }
  }
}

// Unified Metrics
export class UnifiedMetrics {
  private config: TelemetryConfig;
  private resource: OTLPResource;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.resource = {
      attributes: [
        { key: 'service.name', value: { stringValue: this.config.serviceName } },
        { key: 'service.version', value: { stringValue: this.config.serviceVersion } },
        { key: 'telemetry.sdk.name', value: { stringValue: 'jinko-mcp-unified' } },
        { key: 'telemetry.sdk.version', value: { stringValue: this.config.serviceVersion } },
      ],
    };

    // Immediate export - no batching or timers to avoid Cloudflare Workers global scope issues
  }

  incrementCounter(name: string, value: number = 1, attributes: Record<string, string> = {}): void {
    this.exportCounter(name, value, attributes);
  }

  recordGaugeValue(name: string, value: number, unit: string, attributes: Record<string, string> = {}): void {
    this.exportGauge(name, value, unit, attributes);
  }

  recordHistogramValue(name: string, value: number, attributes: Record<string, string> = {}): void {
    this.exportHistogram(name, value, attributes);
  }

  private async exportCounter(name: string, value: number, attributes: Record<string, string>): Promise<void> {
    const now = Date.now() * 1000000; // Convert to nanoseconds
    const startTime = (Date.now() - 60000) * 1000000; // Start time 1 minute ago
    
    // Add version information to attributes
    const enrichedAttributes = {
      ...attributes,
      version: this.config.serviceVersion,
      service: this.config.serviceName,
    };
    
    const metric: OTLPMetric = {
      name,
      description: `Counter metric: ${name}`,
      unit: "1",
      sum: {
        dataPoints: [{
          timeUnixNano: now.toString(),
          asDouble: value,
          attributes: Object.entries(enrichedAttributes).map(([k, v]) => ({
            key: k,
            value: { stringValue: v }
          })),
        }],
        aggregationTemporality: 2, // Cumulative
        isMonotonic: true,
      },
    };

    await this.sendMetrics([metric]);
  }

  private async exportGauge(name: string, value: number, unit: string, attributes: Record<string, string>): Promise<void> {
    const now = Date.now() * 1000000; // Convert to nanoseconds
    
    // Add version information to attributes
    const enrichedAttributes = {
      ...attributes,
      version: this.config.serviceVersion,
      service: this.config.serviceName,
    };
    
    const metric: OTLPMetric = {
      name,
      description: `Gauge metric: ${name}`,
      unit: unit,
      gauge: {
        dataPoints: [{
          timeUnixNano: now.toString(),
          asDouble: value,
          attributes: Object.entries(enrichedAttributes).map(([k, v]) => ({
            key: k,
            value: { stringValue: v }
          })),
        }],
      },
    };

    await this.sendMetrics([metric]);
  }

  private async exportHistogram(name: string, value: number, attributes: Record<string, string>): Promise<void> {
    const now = Date.now() * 1000000; // Convert to nanoseconds
    const startTime = (Date.now() - 60000) * 1000000; // Start time 1 minute ago
    
    // Add version information to attributes
    const enrichedAttributes = {
      ...attributes,
      version: this.config.serviceVersion,
      service: this.config.serviceName,
    };
    
    // Create proper histogram buckets based on the value
    const buckets = [10, 50, 100, 500, 1000, 5000];
    const bucketCounts = new Array(buckets.length + 1).fill(0);
    
    // Find which bucket this value falls into
    let bucketIndex = buckets.findIndex(bound => value <= bound);
    if (bucketIndex === -1) bucketIndex = buckets.length; // Last bucket (infinity)
    
    // Increment the appropriate bucket and all previous buckets (cumulative)
    for (let i = bucketIndex; i < bucketCounts.length; i++) {
      bucketCounts[i] = 1;
    }
    
    const metric: OTLPMetric = {
      name,
      description: `Histogram metric: ${name}`,
      unit: name.includes('duration') || name.includes('time') ? 'ms' : '1',
      histogram: {
        dataPoints: [{
          timeUnixNano: now.toString(),
          count: 1,
          sum: value,
          bucketCounts,
          explicitBounds: buckets,
          attributes: Object.entries(enrichedAttributes).map(([k, v]) => ({
            key: k,
            value: { stringValue: v }
          })),
        }],
        aggregationTemporality: 2, // Cumulative
      },
    };

    await this.sendMetrics([metric]);
  }

  private async sendMetrics(metrics: OTLPMetric[]): Promise<void> {
    const payload = {
      resourceMetrics: [{
        resource: this.resource,
        scopeMetrics: [{
          scope: {
            name: 'jinko-mcp-metrics',
            version: this.config.serviceVersion,
          },
          metrics,
        }],
      }],
    };

    try {
      const response = await fetch(`${this.config.endpoint}/v1/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(payload),
      });

      console.error(JSON.stringify(payload));

      if (!response.ok) {
        console.error(`Failed to send metrics: ${response.status} ${response.statusText}`);
      } else {
        console.error(`Metrics sent successfully: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending metrics to OTLP collector:', error);
    }
  }

  // Convenience methods for common metrics
  recordToolCall(toolName: string, duration_ms: number, status: string): void {
    this.incrementCounter('mcp_tool_call', 1, { tool_name: toolName, status });
    this.recordGaugeValue('mcp_tool_duration', duration_ms, "ms", { tool_name: toolName, status });
  }

  // Async helper methods for OTLP export
  async recordCounter(name: string, value: number, attributes: Record<string, string> = {}): Promise<void> {
    await this.exportCounter(name, value, attributes);
  }

  async recordGauge(name: string, value: number, unit: string, attributes: Record<string, string> = {}): Promise<void> {
    await this.exportGauge(name, value, unit, attributes);
  }

  async recordHistogram(name: string, value: number, attributes: Record<string, string> = {}): Promise<void> {
    await this.exportHistogram(name, value, attributes);
  }

  private sanitizeEndpoint(endpoint: string): string {
    try {
      const url = new URL(endpoint);
      return `${url.protocol}//${url.host}${url.pathname}`;
    } catch {
      return endpoint.split('?')[0];
    }
  }

  // Hotel-specific metrics methods
  async recordHotelSearchCall(params: {
    location_name?: string;
    check_in_date: string;
    nights: number;
    total_travelers: number;
    status: string;
  }): Promise<void> {
    await this.recordCounter('hotel_search_calls_total', 1, {
      location: params.location_name || 'unknown',
      status: params.status
    });
    
    await this.recordGauge('hotel_search_nights', params.nights, "1", {
      location: params.location_name || 'unknown'
    });
    
    await this.recordGauge('hotel_search_travelers', params.total_travelers, "1", {
      location: params.location_name || 'unknown'
    });
  }

  async recordHotelSearchResults(count: number): Promise<void> {
    await this.recordGauge('hotel_search_results_count', count, "1");
    await this.recordCounter('hotel_search_results_total', count);
  }

  async recordApiCall(endpoint: string, method: string, duration_ms: number, status: string): Promise<void> {
    await this.recordCounter('api_calls_total', 1, {
      endpoint: this.sanitizeEndpoint(endpoint),
      method,
      status
    });
    
    await this.recordGauge('api_call_duration', duration_ms, 'ms', {
      endpoint: this.sanitizeEndpoint(endpoint),
      method,
      status
    });
  }

  async shutdown(): Promise<void> {
    // No batching to flush - immediate export means nothing to do
  }
}

// Unified Instrumentation
export class UnifiedInstrumentation {
  private logger: UnifiedLogger;
  private metrics: UnifiedMetrics;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.logger = new UnifiedLogger(config);
    this.metrics = new UnifiedMetrics(config);
    
  }

  getLogger(): UnifiedLogger {
    return this.logger;
  }

  getMetrics(): UnifiedMetrics {
    return this.metrics;
  }

  async shutdown(): Promise<void> {
    await this.metrics.shutdown();
  }
}