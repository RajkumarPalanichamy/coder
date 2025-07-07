'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import AdminSidebar from '../../../components/AdminSidebar';
import { 
  DATA_TYPES, 
  DATA_TYPE_LABELS, 
  DATA_TYPE_EXAMPLES, 
  DATA_TYPE_DESCRIPTIONS,
  validateDataType,
  autoDetectDataType 
} from '../../../../lib/dataTypeHelpers';
import { PROGRAMMING_LANGUAGES, DIFFICULTY_LEVELS } from '../../../../lib/constants';

export default function AdminProblemCreatePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    category: 'javascript',
    constraints: '',
    starterCode: '',
    solution: '',
    tags: '',
    examples: [{ input: '', output: '', explanation: '', inputType: 'string', outputType: 'string' }],
    testCases: [{ input: '', output: '', inputType: 'string', outputType: 'string', isHidden: false }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Update starter code template when category changes
      if (name === 'category') {
        const template = newData.testCases.some(tc => tc.inputType === 'multiple_params') 
          ? PROGRAMMING_LANGUAGES[value].multiParamTemplate
          : PROGRAMMING_LANGUAGES[value].defaultTemplate;
        newData.starterCode = template;
      }
      
      return newData;
    });
  };

  const handleTestCaseChange = (index, e) => {
    const newTestCases = [...formData.testCases];
    if (e.target.name === 'isHidden') {
      newTestCases[index][e.target.name] = e.target.checked;
    } else {
      newTestCases[index][e.target.name] = e.target.value;
      
      // Auto-detect data type when input/output changes
      if (e.target.name === 'input' && e.target.value.trim()) {
        const detectedType = autoDetectDataType(e.target.value);
        if (DATA_TYPES.INPUT.includes(detectedType)) {
          newTestCases[index].inputType = detectedType;
        }
      } else if (e.target.name === 'output' && e.target.value.trim()) {
        const detectedType = autoDetectDataType(e.target.value);
        if (DATA_TYPES.OUTPUT.includes(detectedType)) {
          newTestCases[index].outputType = detectedType;
        }
      }
    }
    
    setFormData({ ...formData, testCases: newTestCases });
    
    // Clear validation errors for this field
    const errorKey = `testCase_${index}_${e.target.name}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', output: '', inputType: 'string', outputType: 'string', isHidden: false }],
    });
  };

  const removeTestCase = (index) => {
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleExampleChange = (index, e) => {
    const newExamples = [...formData.examples];
    newExamples[index][e.target.name] = e.target.value;
    
    // Auto-detect data type when input/output changes
    if (e.target.name === 'input' && e.target.value.trim()) {
      const detectedType = autoDetectDataType(e.target.value);
      if (DATA_TYPES.INPUT.includes(detectedType)) {
        newExamples[index].inputType = detectedType;
      }
    } else if (e.target.name === 'output' && e.target.value.trim()) {
      const detectedType = autoDetectDataType(e.target.value);
      if (DATA_TYPES.OUTPUT.includes(detectedType)) {
        newExamples[index].outputType = detectedType;
      }
    }
    
    setFormData({ ...formData, examples: newExamples });
    
    // Clear validation errors for this field
    const errorKey = `example_${index}_${e.target.name}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '', inputType: 'string', outputType: 'string' }],
    });
  };

  const removeExample = (index) => {
    const newExamples = formData.examples.filter((_, i) => i !== index);
    setFormData({ ...formData, examples: newExamples });
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate test cases
    formData.testCases.forEach((tc, index) => {
      if (tc.input.trim()) {
        const inputValidation = validateDataType(tc.input, tc.inputType);
        if (!inputValidation.isValid) {
          errors[`testCase_${index}_input`] = inputValidation.error;
        }
      }
      
      if (tc.output.trim()) {
        const outputValidation = validateDataType(tc.output, tc.outputType);
        if (!outputValidation.isValid) {
          errors[`testCase_${index}_output`] = outputValidation.error;
        }
      }
    });
    
    // Validate examples
    formData.examples.forEach((ex, index) => {
      if (ex.input.trim()) {
        const inputValidation = validateDataType(ex.input, ex.inputType);
        if (!inputValidation.isValid) {
          errors[`example_${index}_input`] = inputValidation.error;
        }
      }
      
      if (ex.output.trim()) {
        const outputValidation = validateDataType(ex.output, ex.outputType);
        if (!outputValidation.isValid) {
          errors[`example_${index}_output`] = outputValidation.error;
        }
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate data types first
    if (!validateForm()) {
      setError('Please fix the validation errors below.');
      setLoading(false);
      return;
    }
    
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

  const DataTypeSelector = ({ value, onChange, types, name, label }) => (
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full text-xs px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        title={DATA_TYPE_DESCRIPTIONS[value]}
      >
        {types.map(type => (
          <option key={type} value={type}>
            {DATA_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
      <div className="text-xs text-gray-400 mt-1">
        Example: <code className="bg-gray-100 px-1 rounded">{DATA_TYPE_EXAMPLES[value]}</code>
      </div>
    </div>
  );

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
                <Plus className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900">Add New Problem</h2>
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
                    <select 
                      id="difficulty" 
                      name="difficulty" 
                      value={formData.difficulty} 
                      onChange={handleChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {Object.entries(DIFFICULTY_LEVELS).map(([value, { label }]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Programming Language</label>
                    <select 
                      id="category" 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {Object.entries(PROGRAMMING_LANGUAGES).map(([value, { label }]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                
                {/* Test Cases Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Test Cases</h3>
                  {formData.testCases.map((tc, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                      >
                        &times;
                      </button>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Input Section */}
                        <div>
                          <label htmlFor={`testCase-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                          <DataTypeSelector
                            value={tc.inputType}
                            onChange={(e) => handleTestCaseChange(index, e)}
                            types={DATA_TYPES.INPUT}
                            name="inputType"
                            label="Input Type"
                          />
                          <textarea 
                            id={`testCase-input-${index}`} 
                            name="input" 
                            value={tc.input} 
                            onChange={(e) => handleTestCaseChange(index, e)} 
                            className={`mt-1 block w-full px-3 py-2 border rounded-md font-mono text-sm ${
                              validationErrors[`testCase_${index}_input`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            rows={3}
                            placeholder={DATA_TYPE_EXAMPLES[tc.inputType]}
                          />
                          {validationErrors[`testCase_${index}_input`] && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors[`testCase_${index}_input`]}</p>
                          )}
                        </div>

                        {/* Output Section */}
                        <div>
                          <label htmlFor={`testCase-output-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Expected Output</label>
                          <DataTypeSelector
                            value={tc.outputType}
                            onChange={(e) => handleTestCaseChange(index, e)}
                            types={DATA_TYPES.OUTPUT}
                            name="outputType"
                            label="Output Type"
                          />
                          <textarea 
                            id={`testCase-output-${index}`} 
                            name="output" 
                            value={tc.output} 
                            onChange={(e) => handleTestCaseChange(index, e)} 
                            className={`mt-1 block w-full px-3 py-2 border rounded-md font-mono text-sm ${
                              validationErrors[`testCase_${index}_output`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            rows={3}
                            placeholder={DATA_TYPE_EXAMPLES[tc.outputType]}
                          />
                          {validationErrors[`testCase_${index}_output`] && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors[`testCase_${index}_output`]}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center pt-2">
                        <input 
                          id={`testCase-hidden-${index}`} 
                          name="isHidden" 
                          type="checkbox" 
                          checked={tc.isHidden} 
                          onChange={(e) => handleTestCaseChange(index, e)} 
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded" 
                        />
                        <label htmlFor={`testCase-hidden-${index}`} className="ml-2 block text-sm text-gray-900">Hidden from students</label>
                        <span className="ml-1 text-xs text-gray-400" title="Hidden test cases are not shown to students but are used for evaluation.">?</span>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addTestCase} className="w-full py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                    + Add Test Case
                  </button>
                </div>

                {/* Examples Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Examples</h3>
                  {formData.examples.map((ex, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md mb-4 space-y-3 relative">
                      <button
                        type="button"
                        onClick={() => removeExample(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                      >
                        &times;
                      </button>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Input Section */}
                        <div>
                          <label htmlFor={`example-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Input</label>
                          <DataTypeSelector
                            value={ex.inputType}
                            onChange={(e) => handleExampleChange(index, e)}
                            types={DATA_TYPES.INPUT}
                            name="inputType"
                            label="Input Type"
                          />
                          <textarea 
                            id={`example-input-${index}`} 
                            name="input" 
                            value={ex.input} 
                            onChange={(e) => handleExampleChange(index, e)} 
                            className={`mt-1 block w-full px-3 py-2 border rounded-md font-mono text-sm ${
                              validationErrors[`example_${index}_input`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            rows={3}
                            placeholder={DATA_TYPE_EXAMPLES[ex.inputType]}
                          />
                          {validationErrors[`example_${index}_input`] && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors[`example_${index}_input`]}</p>
                          )}
                        </div>

                        {/* Output Section */}
                        <div>
                          <label htmlFor={`example-output-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Expected Output</label>
                          <DataTypeSelector
                            value={ex.outputType}
                            onChange={(e) => handleExampleChange(index, e)}
                            types={DATA_TYPES.OUTPUT}
                            name="outputType"
                            label="Output Type"
                          />
                          <textarea 
                            id={`example-output-${index}`} 
                            name="output" 
                            value={ex.output} 
                            onChange={(e) => handleExampleChange(index, e)} 
                            className={`mt-1 block w-full px-3 py-2 border rounded-md font-mono text-sm ${
                              validationErrors[`example_${index}_output`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            rows={3}
                            placeholder={DATA_TYPE_EXAMPLES[ex.outputType]}
                          />
                          {validationErrors[`example_${index}_output`] && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors[`example_${index}_output`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Explanation Section - Full width */}
                      <div>
                        <label htmlFor={`example-explanation-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                        <textarea 
                          id={`example-explanation-${index}`} 
                          name="explanation" 
                          value={ex.explanation} 
                          onChange={(e) => handleExampleChange(index, e)} 
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm" 
                          rows={2}
                          placeholder="Explain how the input produces the output..."
                        />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addExample} className="w-full py-2 px-4 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                    + Add Example
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Problem'}
                </button>
                <div className="text-center mt-2">
                  <Link href="/admin/dashboard?tab=problems" className="text-indigo-600 hover:underline">Back to Problems</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 