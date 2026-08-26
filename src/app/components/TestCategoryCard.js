"use client";

import { useState } from 'react';
import { Target } from 'lucide-react';
import { resolveCategoryImage } from '@/lib/categoryImages';

export default function TestCategoryCard({ category, collection, onClick }) {
  const [broken, setBroken] = useState(false);
  const image = resolveCategoryImage(category, collection);
  const showImage = Boolean(image) && !broken;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100"
    >
      <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 text-white">
        <h3 className="text-lg font-semibold">{category}</h3>
        <p className="text-sm opacity-90">Test Category</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          {showImage ? (
            <img
              src={image}
              alt={`${category} illustration`}
              className="w-14 h-14 rounded-lg object-cover border border-gray-100"
              onError={() => setBroken(true)}
            />
          ) : (
            <Target className="w-8 h-8 text-green-500" />
          )}
          <span className="text-2xl font-bold text-gray-700">∞</span>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Practice {category} tests to improve your skills
        </p>
        <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
          Continue
        </button>
      </div>
    </div>
  );
}
