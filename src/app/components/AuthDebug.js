'use client';

import { useState, useEffect } from 'react';
import { Bug, Eye, EyeOff, RefreshCw } from 'lucide-react';

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      // Test authentication endpoint
      const authRes = await fetch('/api/test-auth', { credentials: 'include' });
      const authData = await authRes.json();

      // Test environment endpoint
      const envRes = await fetch('/api/check-env', { credentials: 'include' });
      const envData = await envRes.json();

      // Check cookies
      const cookies = document.cookie;

      setDebugInfo({
        auth: authData,
        environment: envData,
        cookies: cookies,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDebug) {
      fetchDebugInfo();
    }
  }, [showDebug]);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Debug Authentication"
      >
        <Bug className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
      <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
        <h3 className="font-semibold">Auth Debug</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDebugInfo}
            disabled={loading}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowDebug(false)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Close"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 max-h-80 overflow-y-auto">
        {debugInfo ? (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Authentication Test</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugInfo.auth, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Environment</h4>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                {JSON.stringify(debugInfo.environment, null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Cookies</h4>
              <div className="bg-gray-100 p-2 rounded text-xs">
                {debugInfo.cookies || 'No cookies found'}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Last updated: {debugInfo.timestamp}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            {loading ? 'Loading debug info...' : 'Click refresh to load debug info'}
          </div>
        )}
      </div>
    </div>
  );
}
