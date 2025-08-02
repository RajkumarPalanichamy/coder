"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Plus, BarChart3, ArrowLeft, BookOpen, FolderOpen } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import CollectionCard from '../../components/CollectionCard';
import TestCategoryCard from '../../components/TestCategoryCard';

export default function AdminTestsPage() {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
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
    setError("");
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
    } catch (err) {
      setError(err.message);
      setCollections([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesByCollection = async () => {
    setLoading(true);
    setError("");
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
    } catch (err) {
      setError(err.message);
      setCategories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsByCollectionAndCategory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/tests/collection/${encodeURIComponent(selectedCollection)}/category/${encodeURIComponent(selectedCategory)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tests');
      }
      const data = await res.json();
      // Ensure data is an array
      const validData = Array.isArray(data) ? data : [];
      setTests(validData);
    } catch (err) {
      setError(err.message);
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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this test?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
      setTests(tests.filter((t) => t._id !== id));
    } catch {
      alert("Failed to delete test.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatCollectionName = (collection) => {
    return collection.charAt(0).toUpperCase() + collection.slice(1);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b pb-4">
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
                ? 'Test Collections Management' 
                : showCategories 
                  ? `${formatCollectionName(selectedCollection)} Categories`
                  : `${formatCategoryName(selectedCategory)} Tests`
              }
            </h1>
            {!showCollections && selectedCollection && (
              <p className="text-gray-600 mt-1">
                Collection: {formatCollectionName(selectedCollection)}
                {selectedCategory && ` - Category: ${formatCategoryName(selectedCategory)}`}
              </p>
            )}
          </div>
            <Link href="/admin/tests/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Test
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
                  ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : showCollections ? (
          // Show collections
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-semibold text-gray-800">Choose a Test Collection</h2>
            </div>
            {collections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-lg mb-2">No test collections found</p>
                <p>Create your first test to get started!</p>
                <Link href="/admin/tests/create" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                  Create First Test
                </Link>
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
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg mb-2">No test categories found for {formatCollectionName(selectedCollection)}</p>
                <p>Create your first test to get started!</p>
                <Link href="/admin/tests/create" className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                  Create First Test
                </Link>
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
                <div className="text-6xl mb-4">📝</div>
                <p>No tests found for {formatCollectionName(selectedCollection)} - {formatCategoryName(selectedCategory)}.</p>
              </div>
              ) : (
                <div className="overflow-x-auto rounded shadow bg-white mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {tests.map((test) => (
                        <tr key={test._id} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-black font-medium">{test.title}</td>
                          <td className="px-6 py-4 text-gray-700 whitespace-pre-wrap max-w-xs truncate">{test.description}</td>
                          <td className="px-6 py-4 text-gray-700">{formatCollectionName(test.collection)}</td>
                          <td className="px-6 py-4 text-gray-700">{formatCategoryName(test.category)}</td>
                          <td className="px-6 py-4 text-gray-700">{test.mcqs?.length || 0}</td>
                          <td className="px-6 py-4 flex gap-2 flex-wrap">
                            <Link href={`/admin/tests/${test._id}/edit`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 text-sm">
                              <Edit className="h-4 w-4" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(test._id)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1 text-sm"
                              disabled={deletingId === test._id}
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletingId === test._id ? 'Deleting...' : 'Delete'}
                            </button>
                            <Link href={`/admin/tests/${test._id}/submissions`} className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm">
                              <BarChart3 className="h-4 w-4" /> Submissions
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 