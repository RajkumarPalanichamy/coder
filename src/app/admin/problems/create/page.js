'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowLeft, Code2, Trash2, AlertCircle, CheckCircle2, FileCode, BookOpen, Hash, Info, Lock, PlusCircle } from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';

export default function AdminProblemCreatePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'level1',
    category: '',
    language: '',
    constraints: '',
    starterCode: '',
    solution: '',
    tags: '',
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '', isHidden: false }],
    timeLimit: 1, // minutes
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value
    });
  };

  const handleTestCaseChange = (index, e) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][e.target.name] = e.target.name === 'isHidden' ? e.target.checked : e.target.value;
    setFormData({ ...formData, testCases: newTestCases });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    // Validation for test cases
    const validTestCases = formData.testCases.filter(tc => tc.input.trim() && tc.output.trim());
    if (validTestCases.length === 0) {
      setError('At least one test case with input and output is required.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          programmingLanguage: formData.language, // Map language to programmingLanguage
          timeLimit: (Number(formData.timeLimit) || 1) * 60, // convert minutes to seconds
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          examples: formData.examples.filter(
            (ex) => ex.input.trim() && ex.output.trim()
          ),
          testCases: validTestCases,
        }),
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Failed to create problem';
        throw new Error(errorMessage);
      }
      setSuccess('Problem created successfully!');
      setTimeout(() => router.push('/admin/dashboard?tab=problems'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/admin/problems" 
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Problems
            </Link>
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">Create New Problem</h1>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileCode className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Problem Details</h2>
                  <p className="text-sm text-gray-500">Create a new coding challenge</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                {success && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{success}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Problem Title
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      placeholder="e.g., Two Sum"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Problem Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      placeholder="Describe the problem and its requirements..."
                    />
                  </div>

                  <div>
                    <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                      Time Limit (minutes)
                    </label>
                    <input
                      id="timeLimit"
                      name="timeLimit"
                      type="number"
                      min="1"
                      max="60"
                      value={formData.timeLimit}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      placeholder="1"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty Level
                      </label>
                      <select
                        id="difficulty"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      >
                        <option value="level1">Level 1</option>
                        <option value="level2">Level 2</option>
                        <option value="level3">Level 3</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <input
                        id="category"
                        name="category"
                        type="text"
                        required
                        value={formData.category}
                        onChange={handleChange}
                        className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                        placeholder="e.g., Arrays & Strings"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      Programming Language
                    </label>
                    <input
                      id="language"
                      name="language"
                      type="text"
                      value={formData.language}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      placeholder="e.g., JavaScript, Python, Java, C++, C#, Go, Rust, etc."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter the programming language name (will be normalized automatically)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-1">
                      Constraints
                    </label>
                    <textarea
                      id="constraints"
                      name="constraints"
                      required
                      value={formData.constraints}
                      onChange={handleChange}
                      rows={2}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors font-mono"
                      placeholder="List the constraints and limitations..."
                    />
                  </div>

                  <div>
                    <label htmlFor="starterCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Starter Code
                    </label>
                    <textarea
                      id="starterCode"
                      name="starterCode"
                      required
                      value={formData.starterCode}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors font-mono"
                      placeholder="function solution() {\n  // Write your code here\n}"
                    />
                  </div>

                  <div>
                    <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-1">
                      Solution
                    </label>
                    <textarea
                      id="solution"
                      name="solution"
                      required
                      value={formData.solution}
                      onChange={handleChange}
                      rows={3}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors font-mono"
                      placeholder="// Provide the solution implementation"
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <input
                      id="tags"
                      name="tags"
                      type="text"
                      value={formData.tags}
                      onChange={handleChange}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                      placeholder="arrays, strings, algorithms (comma separated)"
                    />
                  </div>
                </div>

                {/* Test Cases Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-medium text-gray-900">Test Cases</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addTestCase}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Case
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.testCases.map((tc, index) => (
                      <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Test Case #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeTestCase(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor={`testCase-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Input
                            </label>
                            <textarea
                              id={`testCase-input-${index}`}
                              name="input"
                              value={tc.input}
                              onChange={(e) => handleTestCaseChange(index, e)}
                              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label htmlFor={`testCase-output-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Expected Output
                            </label>
                            <textarea
                              id={`testCase-output-${index}`}
                              name="output"
                              value={tc.output}
                              onChange={(e) => handleTestCaseChange(index, e)}
                              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={`testCase-hidden-${index}`}
                            name="isHidden"
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) => handleTestCaseChange(index, e)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <label htmlFor={`testCase-hidden-${index}`} className="text-sm text-gray-700">
                            Hidden test case
                          </label>
                          <Info className="h-4 w-4 text-gray-400" title="Hidden test cases are not shown to users" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examples Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-lg font-medium text-gray-900">Examples</h3>
                    </div>
                    <button
                      type="button"
                      onClick={addExample}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Example
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.examples.map((ex, index) => (
                      <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Example #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeExample(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label htmlFor={`example-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Input
                            </label>
                            <textarea
                              id={`example-input-${index}`}
                              name="input"
                              value={ex.input}
                              onChange={(e) => handleExampleChange(index, e)}
                              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label htmlFor={`example-output-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Expected Output
                            </label>
                            <textarea
                              id={`example-output-${index}`}
                              name="output"
                              value={ex.output}
                              onChange={(e) => handleExampleChange(index, e)}
                              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label htmlFor={`example-explanation-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Explanation
                            </label>
                            <textarea
                              id={`example-explanation-${index}`}
                              name="explanation"
                              value={ex.explanation}
                              onChange={(e) => handleExampleChange(index, e)}
                              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6">
                  <Link
                    href="/admin/problems"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    {loading ? 'Creating...' : 'Create Problem'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 