"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowLeft, FolderOpen } from 'lucide-react';
import CollectionCard from '../../components/CollectionCard';
import TestCategoryCard from '../../components/TestCategoryCard';

export default function TestListPage() {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCollections, setShowCollections] = useState(true);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    if (showCollections) {
      fetchCollections();
    }
  }, [showCollections]);

  useEffect(() => {
    if (selectedCollection && showCategories) {
      fetchCategoriesByCollection();
    }
  }, [selectedCollection, showCategories]);

  useEffect(() => {
    if (selectedCollection && selectedCategory) {
      fetchTestsByCollectionAndCategory();
    }
  }, [selectedCollection, selectedCategory]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tests/collections');
      if (!res.ok) {
        throw new Error('Failed to fetch collections');
      }
      const data = await res.json();
      // Ensure data is an array and filter out invalid entries
      const validData = Array.isArray(data) ? data.filter(item => 
        item && 
        item.collection && 
        typeof item.collection === 'string' &&
        item.collection.trim().length > 0
      ) : [];
      setCollections(validData);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setCollections([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesByCollection = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tests/collection/${encodeURIComponent(selectedCollection)}/categories`);
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await res.json();
      // Ensure data is an array and filter out invalid entries
      const validData = Array.isArray(data) ? data.filter(item => 
        item && 
        item.category && 
        typeof item.category === 'string' &&
        item.category.trim().length > 0
      ) : [];
      setCategories(validData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsByCollectionAndCategory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tests/collection/${encodeURIComponent(selectedCollection)}/category/${encodeURIComponent(selectedCategory)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tests');
      }
      const data = await res.json();
      // Ensure data is an array
      const validData = Array.isArray(data) ? data : [];
      setTests(validData);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setTests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollection(collection);
    setSelectedCategory("");
    setShowCollections(false);
    setShowCategories(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowCategories(false);
  };

  const handleBackToCollections = () => {
    setSelectedCollection("");
    setSelectedCategory("");
    setShowCollections(true);
    setShowCategories(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory("");
    setShowCategories(true);
  };

  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatCollectionName = (collection) => {
    return collection.charAt(0).toUpperCase() + collection.slice(1);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto py-8 px-4 md:px-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {!showCollections && (
              <button
                onClick={
                  showCategories ? handleBackToCollections : 
                  selectedCategory ? handleBackToCategories : 
                  handleBackToCollections
                }
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {showCategories ? 'Back to Collections' : 
                 selectedCategory ? 'Back to Categories' : 
                 'Back to Collections'}
              </button>
            )}
            <h1 className="text-3xl font-bold text-black">
              {showCollections 
                ? 'Test Collections' 
                : showCategories 
                  ? `${formatCollectionName(selectedCollection)} Categories`
                  : `${formatCategoryName(selectedCategory)} Tests`
              }
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : showCollections ? (
          // Show collections
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-800">Choose a Test Collection</h2>
            </div>
            {collections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test collections found. Contact your admin to create some tests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collections
                  .filter(collectionData => collectionData && collectionData.collection) // Filter out invalid entries
                  .map((collectionData) => (
                    <CollectionCard
                      key={collectionData.collection}
                      collection={collectionData.collection}
                      testCount={collectionData.count || 0}
                      onClick={() => handleCollectionSelect(collectionData.collection)}
                    />
                  ))}
              </div>
            )}
          </div>
        ) : showCategories ? (
          // Show categories
          <div>
            <div className="flex items-center gap-2 mb-6">
              <FolderOpen className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-800">Choose Test Category for {formatCollectionName(selectedCollection)}</h2>
            </div>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test categories found for {formatCollectionName(selectedCollection)}. Contact your admin to create some tests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories
                  .filter(categoryData => categoryData && categoryData.category) // Filter out invalid entries
                  .map((categoryData) => (
                    <TestCategoryCard
                      key={categoryData.category}
                      category={categoryData.category}
                      testCount={categoryData.count || 0}
                      onClick={() => handleCategorySelect(categoryData.category)}
                    />
                  ))}
              </div>
            )}
          </div>
        ) : (
          // Show tests for selected category
          <div>
            {tests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tests found for {formatCollectionName(selectedCollection)} - {formatCategoryName(selectedCategory)}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map(test => (
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