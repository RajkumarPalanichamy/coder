'use client';

import ProblemFlow from '../../components/ProblemFlow';

export default function DemoProblemFlowPage() {
  return (
    <div>
      <div className="bg-blue-600 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Problem Flow Component Demo</h1>
          <p className="text-blue-100">Modern three-step problem selection interface</p>
        </div>
      </div>
      <ProblemFlow />
    </div>
  );
}
