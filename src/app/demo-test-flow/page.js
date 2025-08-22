'use client';

import TestFlow from '../../components/TestFlow';

export default function DemoTestFlowPage() {
  return (
    <div>
      <div className="bg-blue-600 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Test Flow Component Demo</h1>
          <p className="text-blue-100">Modern three-step test selection interface for aptitude tests</p>
        </div>
      </div>
      <TestFlow />
    </div>
  );
}
