import { useState, useEffect } from 'react';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
}

const HealthCheck = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
          <span className="text-gray-600">Checking system health...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-red-800">Health check failed: {error}</span>
        </div>
        <button
          onClick={fetchHealth}
          className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const bgColor = health?.status === 'ok' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = health?.status === 'ok' ? 'border-green-300' : 'border-red-300';
  const textColor = health?.status === 'ok' ? 'text-green-800' : 'text-red-800';
  const dotColor = health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`${bgColor} border ${borderColor} p-4 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 ${dotColor} rounded-full`}></div>
          <span className={`font-medium ${textColor}`}>
            System Status: {health?.status?.toUpperCase()}
          </span>
        </div>
        <button
          onClick={fetchHealth}
          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>
      {health && (
        <div className={`mt-2 text-sm ${textColor}`}>
          <div>Environment: {health.environment}</div>
          <div>Uptime: {Math.floor(health.uptime / 60)} minutes</div>
          <div>Last checked: {new Date(health.timestamp).toLocaleTimeString()}</div>
        </div>
      )}
    </div>
  );
};

export default HealthCheck;