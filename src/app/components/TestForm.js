import { useState } from 'react';

export default function TestForm({ initialData = {}, mcqList = [], onSubmit }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [language, setLanguage] = useState(initialData.language || '');
  const [availableFrom, setAvailableFrom] = useState(initialData.availableFrom ? initialData.availableFrom.slice(0, 16) : '');
  const [availableTo, setAvailableTo] = useState(initialData.availableTo ? initialData.availableTo.slice(0, 16) : '');
  const [selectedMCQs, setSelectedMCQs] = useState(initialData.mcqs || []);
  const [error, setError] = useState('');

  const handleMCQToggle = (id) => {
    setSelectedMCQs(selectedMCQs.includes(id)
      ? selectedMCQs.filter(mid => mid !== id)
      : [...selectedMCQs, id]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || selectedMCQs.length === 0) {
      setError('Title and at least one MCQ are required.');
      return;
    }
    onSubmit({
      title,
      description,
      language,
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      availableTo: availableTo ? new Date(availableTo) : undefined,
      mcqs: selectedMCQs,
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
      <div className="flex gap-4">
        <div>
          <label className="block font-medium mb-1">Available From</label>
          <input
            type="datetime-local"
            className="border px-3 py-2 rounded text-black"
            value={availableFrom}
            onChange={e => setAvailableFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Available To</label>
          <input
            type="datetime-local"
            className="border px-3 py-2 rounded text-black"
            value={availableTo}
            onChange={e => setAvailableTo(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Select MCQs</label>
        <div className="max-h-48 overflow-y-auto border rounded p-2">
          {mcqList.map(mcq => (
            <div key={mcq._id} className="flex items-center mb-1">
              <input
                type="checkbox"
                checked={selectedMCQs.includes(mcq._id)}
                onChange={() => handleMCQToggle(mcq._id)}
                className="mr-2"
              />
              <span className="text-black">{mcq.question}</span>
            </div>
          ))}
        </div>
      </div>
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
        Save Test
      </button>
    </form>
  );
} 