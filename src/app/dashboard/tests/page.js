"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowLeft, FolderOpen, BarChart3, ChevronRight, Search, Filter } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('regular');
  const [weeklyProgress, setWeeklyProgress] = useState({
    dayStreak: 0,
    completed: 0,
    progress: 0,
    rank: 'Top 50%',
    points: 0
  });
  const [progressLoading, setProgressLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyProgress();
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

  const fetchWeeklyProgress = async () => {
    try {
      const res = await fetch('/api/user/weekly-progress', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setWeeklyProgress(data);
      }
    } catch (err) {
      console.error('Error fetching weekly progress:', err);
    } finally {
      setProgressLoading(false);
    }
  };

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tests/collections', { credentials: 'include' });
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
      const res = await fetch(`/api/tests/collection/${encodeURIComponent(selectedCollection)}/categories`, { credentials: 'include' });
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
      const res = await fetch(`/api/tests/collection/${encodeURIComponent(selectedCollection)}/category/${encodeURIComponent(selectedCategory)}`, { credentials: 'include' });
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

  const getFilteredItems = (items, searchTerm) => {
    if (!searchTerm) return items;
    return items.filter(item => {
      const name = item.collection || item.category || item.title;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - This Week Dashboard */}
      <div className="bg-white py-8 px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">Total Progress</h1>
          </div>
          
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Day Streak */}
            <div className="bg-purple-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-purple-200 rounded mb-1"></div>
                  <div className="h-4 bg-purple-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{weeklyProgress.dayStreak}</div>
                  <div className="text-sm text-purple-600 font-medium">Day Streak</div>
                </>
              )}
            </div>
            
            {/* Completed */}
            <div className="bg-green-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-green-200 rounded mb-1"></div>
                  <div className="h-4 bg-green-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-green-600 mb-1">{weeklyProgress.completed}</div>
                  <div className="text-sm text-green-600 font-medium">Completed</div>
                </>
              )}
            </div>
            
            {/* Progress */}
            <div className="bg-purple-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-purple-200 rounded mb-1"></div>
                  <div className="h-4 bg-purple-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{weeklyProgress.progress}%</div>
                  <div className="text-sm text-purple-600 font-medium">Progress</div>
                </>
              )}
            </div>
            
            {/* Rank */}
            <div className="bg-yellow-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-yellow-200 rounded mb-1"></div>
                  <div className="h-4 bg-yellow-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-orange-600 mb-1">{weeklyProgress.rank}</div>
                  <div className="text-sm text-orange-600 font-medium">Rank</div>
                </>
              )}
            </div>
            
            {/* Points */}
            <div className="bg-blue-100 rounded-lg p-4 text-center">
              {progressLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-blue-200 rounded mb-1"></div>
                  <div className="h-4 bg-blue-200 rounded"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{weeklyProgress.points}</div>
                  <div className="text-sm text-blue-600 font-medium">Points</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${showCollections ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                showCollections ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Collection</span>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400" />
            
            <div className={`flex items-center ${showCategories ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                showCategories ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Category</span>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400" />
            
            <div className={`flex items-center ${!showCollections && !showCategories ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                !showCollections && !showCategories ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Test</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        {!showCollections && (
          <button
            onClick={showCategories ? handleBackToCollections : handleBackToCategories}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {showCategories ? 'Back to Collections' : 'Back to Categories'}
          </button>
        )}

        {/* Search and Filter */}
        {/* <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('regular')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'regular'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-50'
              }`}
            >
              Regular
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'custom'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-50'
              }`}
            >
              Custom
            </button>
          </div>
        </div> */}

        {/* Content Based on Current Step */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : showCollections ? (
          // Show collections
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose a Test Collection</h2>
            {collections.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test collections found. Contact your admin to create some tests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredItems(collections, searchTerm)
                  .filter(collectionData => collectionData && collectionData.collection)
                  .map((collectionData) => (
                    <CollectionCard
                      key={collectionData.collection}
                      collection={collectionData.collection}
                      onClick={() => handleCollectionSelect(collectionData.collection)}
                    />
                  ))}
              </div>
            )}
          </div>
        ) : showCategories ? (
          // Show categories
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Test Category for {formatCollectionName(selectedCollection)}</h2>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No test categories found for {formatCollectionName(selectedCollection)}. Contact your admin to create some tests!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredItems(categories, searchTerm)
                  .filter(categoryData => categoryData && categoryData.category)
                  .map((categoryData) => (
                    <TestCategoryCard
                      key={categoryData.category}
                      category={categoryData.category}
                      onClick={() => handleCategorySelect(categoryData.category)}
                    />
                  ))}
              </div>
            )}
          </div>
        ) : (
          // Show tests for selected category
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Test from {formatCollectionName(selectedCollection)} - {formatCategoryName(selectedCategory)}</h2>
            {tests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tests found for {formatCollectionName(selectedCollection)} - {formatCategoryName(selectedCategory)}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredItems(tests, searchTerm).map(test => (
                  <div key={test._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-4 text-white">
                      <h3 className="text-lg font-semibold">{test.title}</h3>
                      <p className="text-sm opacity-90">{formatCategoryName(test.category)}</p>
                    </div>
                    <div className="p-4">
                      <div className="text-gray-600 mb-4 line-clamp-2 min-h-[40px] whitespace-pre-wrap">{test.description}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
                      <Link
                        href={`/dashboard/tests/${test._id}`}
                        className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors font-medium text-center block"
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
    </div>
  );
} 