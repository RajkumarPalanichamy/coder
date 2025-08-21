import { useState } from 'react';

function emptyMCQ() {
  return {
    question: '',
    options: ['', '', '', ''],
    correctOption: 0,
  };
}

export default function TestForm({ initialData = {}, onSubmit }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [collection, setCollection] = useState(initialData.collection || '');
  const [language, setLanguage] = useState(initialData.language || '');
  const [category, setCategory] = useState(initialData.category || '');
  const [duration, setDuration] = useState(initialData.duration || 60);
  const [mcqs, setMcqs] = useState(initialData.mcqs || []);
  const [error, setError] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [mcqDraft, setMcqDraft] = useState(emptyMCQ());

  // Predefined collections for quick selection
  const predefinedCollections = [
    'Aptitude', 'Technical', 'Verbal', 'Quantitative', 
    'General Knowledge', 'Soft Skills', 'Competitive', 'Programming'
  ];

  // Predefined categories for quick selection
  const predefinedCategories = [
    'OOPs', 'C++', 'C#', 'Java', 'Python', 'JavaScript', 
    'Data Structures', 'Algorithms', 'Web Development', 
    'Database', 'Software Engineering', 'System Design'
  ];

  const handleAddOrUpdateMCQ = () => {
    if (!mcqDraft.question.trim() || mcqDraft.options.some(opt => !opt.trim())) {
      setError('All MCQ fields are required.');
      return;
    }
    if (editingIdx !== null) {
      // Update existing MCQ
      const updated = [...mcqs];
      updated[editingIdx] = mcqDraft;
      setMcqs(updated);
      setEditingIdx(null);
    } else {
      setMcqs([...mcqs, mcqDraft]);
    }
    setMcqDraft(emptyMCQ());
    setError('');
  };

  const handleEditMCQ = (idx) => {
    setEditingIdx(idx);
    setMcqDraft(mcqs[idx]);
  };

  const handleDeleteMCQ = (idx) => {
    setMcqs(mcqs.filter((_, i) => i !== idx));
    if (editingIdx === idx) {
      setEditingIdx(null);
      setMcqDraft(emptyMCQ());
    }
  };

  const handleOptionChange = (idx, value) => {
    const newOptions = [...mcqDraft.options];
    newOptions[idx] = value;
    setMcqDraft({ ...mcqDraft, options: newOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || mcqs.length === 0) {
      setError('Title, category, and at least one MCQ are required.');
      return;
    }
    // Use default collection if not provided
    const finalCollection = collection.trim() || 'General';
    if (duration < 1 || duration > 300) {
      setError('Duration must be between 1 and 300 minutes.');
      return;
    }
    onSubmit({
      title,
      description,
      collection: finalCollection,
      language,
      category,
      duration: parseInt(duration),
      mcqs,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 bg-red-50 p-3 rounded border">{error}</div>}
      <div>
        <label className="block font-medium mb-1">Level</label>
        <input
          className="w-full border px-3 py-2 rounded text-black"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          className="w-full border px-3 py-2 rounded text-black"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Collection</label>
        <div className="space-y-2">
          <input
            className="w-full border px-3 py-2 rounded text-black"
            value={collection}
            onChange={e => setCollection(e.target.value)}
            placeholder="Enter collection or select from below"
            required
          />
          <div className="flex flex-wrap gap-2">
            {predefinedCollections.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setCollection(col)}
                className={`px-3 py-1 text-sm rounded border transition-colors ${
                  collection === col 
                    ? 'bg-purple-100 border-purple-300 text-purple-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Language</label>
        <input
          className="w-full border px-3 py-2 rounded text-black"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Category</label>
        <div className="space-y-2">
          <input
            className="w-full border px-3 py-2 rounded text-black"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Enter category or select from below"
            required
          />
          <div className="flex flex-wrap gap-2">
            {predefinedCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-sm rounded border transition-colors ${
                  category === cat 
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Duration (minutes)</label>
        <div className="space-y-2">
          <input
            type="number"
            min="1"
            max="300"
            className="w-full border px-3 py-2 rounded text-black"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="Enter duration in minutes"
            required
          />
          <div className="flex flex-wrap gap-2">
            {[15, 30, 45, 60, 90, 120, 180].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setDuration(time)}
                className={`px-3 py-1 text-sm rounded border transition-colors ${
                  parseInt(duration) === time 
                    ? 'bg-green-100 border-green-300 text-green-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {time}m
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">Quick select common durations or enter custom value (1-300 minutes)</p>
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">MCQs for this Test</label>
        <div className="space-y-4 mb-4">
          {mcqs.length === 0 && <div className="text-gray-500">No MCQs added yet.</div>}
          {mcqs.map((mcq, idx) => (
            <div key={idx} className="border rounded p-3 bg-white flex flex-col gap-2">
              <div className="font-semibold">Q{idx + 1}: {mcq.question}</div>
              <ol className="list-decimal ml-6">
                {mcq.options.map((opt, oidx) => (
                  <li key={oidx} className={oidx === mcq.correctOption ? 'font-semibold text-green-700' : ''}>{opt}</li>
                ))}
              </ol>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => handleEditMCQ(idx)} className="text-indigo-600 hover:underline">Edit</button>
                <button type="button" onClick={() => handleDeleteMCQ(idx)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
        <div className="border rounded p-4 bg-gray-50">
          <div className="font-semibold mb-2">{editingIdx !== null ? 'Edit MCQ' : 'Add New MCQ'}</div>
          <div className="mb-2">
            <input
              className="w-full border px-3 py-2 rounded text-black"
              placeholder="Question"
              value={mcqDraft.question}
              onChange={e => setMcqDraft({ ...mcqDraft, question: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label className="block font-medium mb-1">Options</label>
            {mcqDraft.options.map((opt, idx) => (
              <div key={idx} className="flex items-center mb-1">
                <input
                  className="flex-1 border px-3 py-2 rounded text-black mr-2"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                />
                <input
                  type="radio"
                  name="correctOption"
                  checked={mcqDraft.correctOption === idx}
                  onChange={() => setMcqDraft({ ...mcqDraft, correctOption: idx })}
                  className="mr-1"
                />
                <span className="text-sm">Correct</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mr-2"
            onClick={handleAddOrUpdateMCQ}
          >
            {editingIdx !== null ? 'Update MCQ' : 'Add MCQ'}
          </button>
          {editingIdx !== null && (
            <button
              type="button"
              className="ml-2 text-gray-600 hover:underline"
              onClick={() => { setEditingIdx(null); setMcqDraft(emptyMCQ()); }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        Save Test
      </button>
    </form>
  );
} 