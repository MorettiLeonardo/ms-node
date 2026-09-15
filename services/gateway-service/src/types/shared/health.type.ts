export interface ServiceHealthStatus {
  status: 'healthy' | 'unhealthy';
  latency_ms?: number;
  error?: string;
}

export interface GatewayHealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptime_seconds: number;
  services: {
    auth_service: ServiceHealthStatus;
    user_service: ServiceHealthStatus;
  };
}
