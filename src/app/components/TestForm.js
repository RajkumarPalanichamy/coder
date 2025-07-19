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
  const [language, setLanguage] = useState(initialData.language || '');
  const [mcqs, setMcqs] = useState(initialData.mcqs || []);
  const [error, setError] = useState('');
  const [editingIdx, setEditingIdx] = useState(null);
  const [mcqDraft, setMcqDraft] = useState(emptyMCQ());

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
    if (!title.trim() || mcqs.length === 0) {
      setError('Title and at least one MCQ are required.');
      return;
    }
    onSubmit({
      title,
      description,
      language,
      mcqs,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label className="block font-medium mb-1">Title</label>
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
        <label className="block font-medium mb-1">Language</label>
        <input
          className="w-full border px-3 py-2 rounded text-black"
          value={language}
          onChange={e => setLanguage(e.target.value)}
        />
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