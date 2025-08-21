import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  Globe, 
  Cpu, 
  HardDrive,
  Wifi,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

export default function AdminSystemHealth() {
  const [systemStatus, setSystemStatus] = useState({
    database: { status: 'healthy', latency: 45, uptime: '99.9%' },
    api: { status: 'healthy', responseTime: 120, requestsPerMinute: 156 },
    judge0: { status: 'healthy', activeJobs: 3, queueSize: 0 },
    storage: { status: 'healthy', used: 65, total: 100, unit: 'GB' },
    network: { status: 'healthy', bandwidth: 85, unit: 'Mbps' },
    security: { status: 'healthy', lastScan: '2 hours ago', threats: 0 }
  });

  const [performanceMetrics, setPerformanceMetrics] = useState({
    cpu: 23,
    memory: 67,
    disk: 45,
    network: 78
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setPerformanceMetrics(prev => ({
        cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 8)),
        disk: Math.max(30, Math.min(80, prev.disk + (Math.random() - 0.5) * 6)),
        network: Math.max(40, Math.min(95, prev.network + (Math.random() - 0.5) * 12))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (value) => {
    if (value < 50) return 'text-green-600';
    if (value < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBarColor = (value) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">System Health</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Services Status */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
          <div className="space-y-3">
            {Object.entries(systemStatus).map(([service, data]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(data.status)}
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{service}</p>
                    <p className="text-sm text-gray-500">
                      {service === 'database' && `Latency: ${data.latency}ms`}
                      {service === 'api' && `Response: ${data.responseTime}ms`}
                      {service === 'judge0' && `Active: ${data.activeJobs} jobs`}
                      {service === 'storage' && `Used: ${data.used}${data.unit}`}
                      {service === 'network' && `Bandwidth: ${data.bandwidth}${data.unit}`}
                      {service === 'security' && `Last scan: ${data.lastScan}`}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            {/* CPU Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                </div>
                <span className={`text-sm font-semibold ${getPerformanceColor(performanceMetrics.cpu)}`}>
                  {performanceMetrics.cpu.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getPerformanceBarColor(performanceMetrics.cpu)}`}
                  style={{ width: `${performanceMetrics.cpu}%` }}
                ></div>
              </div>
            </div>

            {/* Memory Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                </div>
                <span className={`text-sm font-semibold ${getPerformanceColor(performanceMetrics.memory)}`}>
                  {performanceMetrics.memory.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getPerformanceBarColor(performanceMetrics.memory)}`}
                  style={{ width: `${performanceMetrics.memory}%` }}
                ></div>
              </div>
            </div>

            {/* Disk Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                </div>
                <span className={`text-sm font-semibold ${getPerformanceColor(performanceMetrics.disk)}`}>
                  {performanceMetrics.disk.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getPerformanceBarColor(performanceMetrics.disk)}`}
                  style={{ width: `${performanceMetrics.disk}%` }}
                ></div>
              </div>
            </div>

            {/* Network Usage */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Network Usage</span>
                </div>
                <span className={`text-sm font-semibold ${getPerformanceColor(performanceMetrics.network)}`}>
                  {performanceMetrics.network.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getPerformanceBarColor(performanceMetrics.network)}`}
                  style={{ width: `${performanceMetrics.network}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <Activity className="h-4 w-4" />
              <span>Refresh Status</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Shield className="h-4 w-4" />
              <span>Run Security Scan</span>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
