"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Filter, ArrowLeft } from 'lucide-react';
import TestCategoryCard from '../../components/TestCategoryCard';

export default function TestListPage() {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategories, setShowCategories] = useState(true);

  useEffect(() => {
    if (showCategories) {
      fetchCategories();
    }
  }, [showCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchTestsByCategory();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tests/categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsByCategory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tests/category/${selectedCategory}`);
      const data = await res.json();
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategories(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory("");
    setShowCategories(true);
    setSearch("");
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto py-8 px-4 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {!showCategories && (
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Categories
              </button>
            )}
            <h1 className="text-3xl font-bold text-black">
              {showCategories 
                ? 'Test Categories' 
                : `${formatCategoryName(selectedCategory)} Tests`
              }
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : showCategories ? (
          // Show categories
          <div>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test categories found. Contact your admin to create some tests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((categoryData) => (
                  <TestCategoryCard
                    key={categoryData.category}
                    category={categoryData.category}
                    testCount={categoryData.count}
                    onClick={() => handleCategorySelect(categoryData.category)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Show tests for selected category
          <div>
            {/* Search bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {filteredTests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tests found for {formatCategoryName(selectedCategory)}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map(test => (
                  <div key={test._id} className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                        <span className="font-semibold text-lg text-black line-clamp-1">{test.title}</span>
                      </div>
                      <div className="text-gray-600 mb-4 line-clamp-2 min-h-[40px] whitespace-pre-wrap">{test.description}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" /> 
                          {test.mcqs?.length ?? 0} Questions
                        </span>
                        {test.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> 
                            {test.duration} min
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mb-4">
                        Category: {formatCategoryName(test.category)}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/dashboard/tests/${test._id}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors w-full text-center font-medium block"
                      >
                        Start Test
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 