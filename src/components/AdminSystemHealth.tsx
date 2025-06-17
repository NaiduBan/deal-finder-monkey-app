
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  HardDrive,
  Wifi,
  RefreshCw
} from 'lucide-react';

interface SystemMetrics {
  uptime: string;
  responseTime: number;
  activeUsers: number;
  errorRate: number;
  databaseConnections: number;
  storageUsed: number;
  memoryUsage: number;
  cpuUsage: number;
}

const AdminSystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: '99.9%',
    responseTime: 120,
    activeUsers: 1247,
    errorRate: 0.02,
    databaseConnections: 25,
    storageUsed: 65,
    memoryUsage: 72,
    cpuUsage: 45
  });
  const [loading, setLoading] = useState(false);

  const refreshMetrics = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMetrics({
        ...metrics,
        responseTime: Math.floor(Math.random() * 200) + 80,
        activeUsers: Math.floor(Math.random() * 500) + 1000,
        errorRate: Math.random() * 0.1,
        databaseConnections: Math.floor(Math.random() * 20) + 15,
        memoryUsage: Math.floor(Math.random() * 30) + 60,
        cpuUsage: Math.floor(Math.random() * 40) + 30
      });
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
    if (value <= thresholds.warning) return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
    return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Health Monitor</span>
          </CardTitle>
          <Button onClick={refreshMetrics} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* System Uptime */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Server className="h-8 w-8 text-blue-500" />
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold">{metrics.uptime}</p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-green-500" />
                  {getStatusBadge(metrics.responseTime, { good: 150, warning: 300 })}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.responseTime, { good: 150, warning: 300 })}`}>
                    {metrics.responseTime}ms
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last hour</p>
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="h-8 w-8 text-purple-500" />
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Current session</p>
                </div>
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  {getStatusBadge(metrics.errorRate * 100, { good: 1, warning: 5 })}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.errorRate * 100, { good: 1, warning: 5 })}`}>
                    {(metrics.errorRate * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Usage */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">CPU Usage</span>
                    </div>
                    <span className={`font-bold ${getStatusColor(metrics.cpuUsage, { good: 60, warning: 80 })}`}>
                      {metrics.cpuUsage}%
                    </span>
                  </div>
                  <Progress value={metrics.cpuUsage} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Memory Usage</span>
                    </div>
                    <span className={`font-bold ${getStatusColor(metrics.memoryUsage, { good: 70, warning: 85 })}`}>
                      {metrics.memoryUsage}%
                    </span>
                  </div>
                  <Progress value={metrics.memoryUsage} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Storage Used</span>
                    </div>
                    <span className={`font-bold ${getStatusColor(metrics.storageUsed, { good: 70, warning: 85 })}`}>
                      {metrics.storageUsed}%
                    </span>
                  </div>
                  <Progress value={metrics.storageUsed} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Database Status */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Database Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Database className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium">Database Connection</p>
                        <p className="text-sm text-gray-600">Primary database</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-1">Connected</Badge>
                      <p className="text-sm text-gray-600">{metrics.databaseConnections} active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wifi className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">API Status</p>
                        <p className="text-sm text-gray-600">External services</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-1">Operational</Badge>
                      <p className="text-sm text-gray-600">All services up</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemHealth;
