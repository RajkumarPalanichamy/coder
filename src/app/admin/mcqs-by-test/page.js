"use client";
import { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';

export default function MCQsByTestPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/tests')
      .then(res => res.json())
      .then(setTests)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-8">
        <h1 className="text-2xl font-bold mb-6 text-black">MCQs by Test Set</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-10">
            {tests.length === 0 && <div>No tests found.</div>}
            {tests.map(test => (
              <div key={test._id} className="bg-white rounded shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-indigo-700">{test.title}</h2>
                {(!test.mcqs || test.mcqs.length === 0) ? (
                  <div className="text-gray-500">No MCQs in this test set.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {test.mcqs.map((mcq, idx) => (
                          <tr key={mcq._id + '-' + idx}>
                            <td className="px-6 py-4 text-black font-medium max-w-xs truncate">{mcq.question}</td>
                            <td className="px-6 py-4 text-gray-700">
                              <ol className="list-decimal ml-4">
                                {mcq.options.map((opt, oidx) => (
                                  <li key={oidx} className={oidx === mcq.correctOption ? 'font-semibold text-green-700' : ''}>{opt}</li>
                                ))}
                              </ol>
                            </td>
                            <td className="px-6 py-4 text-green-700 font-bold">
                              {mcq.options[mcq.correctOption]}
                            </td>
                            <td className="px-6 py-4 text-gray-500">{mcq.language}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 