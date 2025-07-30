'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import AdminSidebar from '../../../../components/AdminSidebar';

export default function AdminProblemEditPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'level1',
    category: '',
    language: 'javascript',
    constraints: '',
    starterCode: '',
    solution: '',
    tags: '',
    isActive: true,
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '', explanation: '', isHidden: true }],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/problems/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch problem');
      setFormData({
        title: data.problem.title,
        description: data.problem.description,
        difficulty: data.problem.difficulty,
        category: data.problem.category,
        language: data.problem.programmingLanguage || 'javascript',
        constraints: data.problem.constraints,
        starterCode: data.problem.starterCode,
        solution: data.problem.solution,
        tags: (data.problem.tags || []).join(', '),
        isActive: data.problem.isActive,
        examples: data.problem.examples && data.problem.examples.length > 0 ? data.problem.examples : [{ input: '', output: '', explanation: '' }],
        testCases: data.problem.testCases && data.problem.testCases.length > 0 ? data.problem.testCases : [{ input: '', output: '', explanation: '', isHidden: true }],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleExampleChange = (index, e) => {
    const newExamples = [...formData.examples];
    newExamples[index][e.target.name] = e.target.value;
    setFormData({ ...formData, examples: newExamples });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }],
    });
  };

  const removeExample = (index) => {
    const newExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: newExamples });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', output: '', isHidden: false }],
    });
  };

  const removeTestCase = (index) => {
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleTestCaseChange = (index, e) => {
    const newTestCases = [...formData.testCases];
    if (e.target.name === 'isHidden') {
      newTestCases[index][e.target.name] = e.target.checked;
    } else {
      newTestCases[index][e.target.name] = e.target.value;
    }
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    // Validation for test cases
    const validTestCases = (formData.testCases || []).filter(tc => tc.input && tc.input.trim() && tc.output && tc.output.trim());
    if (validTestCases.length === 0) {
      setError('At least one test case with input and output is required.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/admin/problems/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          programmingLanguage: formData.language, // Map language to programmingLanguage
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          examples: formData.examples.filter(
            (ex) => ex.input.trim() && ex.output.trim()
          ),
          testCases: validTestCases,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update problem');
      setSuccess('Problem updated successfully!');
      setTimeout(() => router.push('/admin/dashboard?tab=problems'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-lg mx-auto py-8">
          <Link href="/admin/problems" className="inline-flex items-center text-indigo-600 hover:underline mb-4">
            &#8592; Back to Problems
          </Link>
          <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded shadow">
              <div className="flex items-center justify-center">
                <Edit className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">Edit Problem</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>}
                  {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">{success}</div>}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input id="title" name="title" type="text" required value={formData.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea id="description" name="description" required value={formData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
                      <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="level1">Level 1</option>
                        <option value="level2">Level 2</option>
                        <option value="level3">Level 3</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                      <input id="category" name="category" type="text" required value={formData.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">Programming Language</label>
                    <input 
                      id="language" 
                      name="language" 
                      type="text"
                      value={formData.language} 
                      onChange={handleChange} 
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., JavaScript, Python, Java, C++, Go, Rust, etc."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter any programming language name (case sensitive)
                    </p>
                  </div>
                  <div>
                    <label htmlFor="constraints" className="block text-sm font-medium text-gray-700">Constraints</label>
                    <textarea id="constraints" name="constraints" required value={formData.constraints} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" rows={2} />
                  </div>
                  <div>
                    <label htmlFor="starterCode" className="block text-sm font-medium text-gray-700">Starter Code</label>
                    <textarea id="starterCode" name="starterCode" required value={formData.starterCode} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={3} />
                  </div>
                  <div>
                    <label htmlFor="solution" className="block text-sm font-medium text-gray-700">Solution</label>
                    <textarea id="solution" name="solution" required value={formData.solution} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={3} />
                  </div>
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                    <input id="tags" name="tags" type="text" value={formData.tags} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div className="flex items-center">
                    <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">Active</label>
                  </div>
                  {/* Examples Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Examples</h3>
                    {formData.examples.map((ex, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-md mb-4 space-y-2 relative">
                        <button
                          type="button"
                          onClick={() => removeExample(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                        <div>
                          <label htmlFor={`example-input-${index}`} className="block text-sm font-medium text-gray-700">Input</label>
                          <textarea id={`example-input-${index}`} name="input" value={ex.input} onChange={(e) => handleExampleChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={2}></textarea>
                        </div>
                        <div>
                          <label htmlFor={`example-output-${index}`} className="block text-sm font-medium text-gray-700">Expected Output</label>
                          <textarea id={`example-output-${index}`} name="output" value={ex.output} onChange={(e) => handleExampleChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={2}></textarea>
                        </div>
                        <div>
                          <label htmlFor={`example-explanation-${index}`} className="block text-sm font-medium text-gray-700">Explanation</label>
                          <textarea id={`example-explanation-${index}`} name="explanation" value={ex.explanation} onChange={(e) => handleExampleChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={2}></textarea>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addExample} className="w-full py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                      Add Example
                    </button>
                  </div>
                  {/* Test Cases Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Test Cases</h3>
                    {formData.testCases && formData.testCases.map((tc, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-md mb-4 space-y-2 relative">
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                        <div>
                          <label htmlFor={`testCase-input-${index}`} className="block text-sm font-medium text-gray-700">Input</label>
                          <textarea id={`testCase-input-${index}`} name="input" value={tc.input} onChange={(e) => handleTestCaseChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={2}></textarea>
                        </div>
                        <div>
                          <label htmlFor={`testCase-output-${index}`} className="block text-sm font-medium text-gray-700">Expected Output</label>
                          <textarea id={`testCase-output-${index}`} name="output" value={tc.output} onChange={(e) => handleTestCaseChange(index, e)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono" rows={2}></textarea>
                        </div>
                        <div className="flex items-center">
                          <input id={`testCase-hidden-${index}`} name="isHidden" type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(index, e)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                          <label htmlFor={`testCase-hidden-${index}`} className="ml-2 block text-sm text-gray-700">Hidden</label>
                          <span className="ml-1 text-xs text-gray-400" title="Hidden test cases are not shown to the user.">?</span>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addTestCase} className="w-full py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                      Add Test Case
                    </button>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? 'Updating...' : 'Update Problem'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 