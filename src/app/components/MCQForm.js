import { useState } from 'react';

export default function MCQForm({ initialData = {}, onSubmit }) {
  const [question, setQuestion] = useState(initialData.question || '');
  const [options, setOptions] = useState(initialData.options || ['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(
    initialData.correctOption !== undefined ? initialData.correctOption : 0
  );
  const [language, setLanguage] = useState(initialData.language || '');
  const [error, setError] = useState('');

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim())) {
      setError('All fields are required.');
      return;
    }
    onSubmit({ question, options, correctOption, language });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label className="block font-medium mb-1">Question</label>
        <input
          className="w-full border px-3 py-2 rounded text-black"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Options</label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center mb-1">
            <input
              className="flex-1 border px-3 py-2 rounded text-black mr-2"
              value={opt}
              onChange={e => handleOptionChange(idx, e.target.value)}
              required
            />
            <input
              type="radio"
              name="correctOption"
              checked={correctOption === idx}
              onChange={() => setCorrectOption(idx)}
              className="mr-1"
            />
            <span className="text-sm">Correct</span>
          </div>
        ))}
      </div>
      <div>
        <label className="block font-medium mb-1">Language</label>
        <input
          className="w-full border px-3 py-2 rounded text-black"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        />
      </div>
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        Save MCQ
      </button>
    </form>
  );
} 