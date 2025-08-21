'use client';

import { useState } from 'react';

export default function TestAuth() {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Check environment
      try {
        const envRes = await fetch('/api/check-env');
        results.environment = await envRes.json();
      } catch (error) {
        results.environment = { error: error.message };
      }

      // Test 2: Check authentication (without credentials)
      try {
        const authRes = await fetch('/api/test-auth');
        results.authWithoutCredentials = await authRes.json();
      } catch (error) {
        results.authWithoutCredentials = { error: error.message };
      }

      // Test 3: Check authentication (with credentials)
      try {
        const authRes = await fetch('/api/test-auth', { credentials: 'include' });
        results.authWithCredentials = await authRes.json();
      } catch (error) {
        results.authWithCredentials = { error: error.message };
      }

      // Test 4: Check user/me endpoint
      try {
        const userRes = await fetch('/api/user/me', { credentials: 'include' });
        results.userMe = await userRes.json();
      } catch (error) {
        results.userMe = { error: error.message };
      }

    } catch (error) {
      results.general = { error: error.message };
    } finally {
      setLoading(false);
    }

    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Page</h1>
        
        <button
          onClick={runTests}
          disabled={loading}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 mb-8"
        >
          {loading ? 'Running Tests...' : 'Run Authentication Tests'}
        </button>

        {Object.keys(testResults).length > 0 && (
          <div className="space-y-6">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                  {testName.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">What to check:</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• <strong>Environment:</strong> JWT_SECRET should be set</li>
            <li>• <strong>Auth without credentials:</strong> Should return 401 or redirect</li>
            <li>• <strong>Auth with credentials:</strong> Should work if logged in</li>
            <li>• <strong>User/me:</strong> Should return user data if authenticated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
