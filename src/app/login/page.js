'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Code2, BookOpen, Users } from 'lucide-react';
import Image from 'next/image';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect based on user role
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-blue-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Feature Cards */}
      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 w-64">
          <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Code2 className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Coding</h3>
          <p className="text-sm text-gray-600">Enhance your skills with our curated collection of coding challenges.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 w-64">
          <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn & Grow</h3>
          <p className="text-sm text-gray-600">Access comprehensive learning materials and improve your knowledge.</p>
        </div>
      </div>

      {/* Feature Cards - Right Side */}
      <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 space-y-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 w-64">
          <div className="bg-violet-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-violet-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Community</h3>
          <p className="text-sm text-gray-600">Connect with fellow learners and share your coding journey.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg transform hover:-translate-y-1 transition-all duration-300 w-64">
          <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
            <Code2 className="h-6 w-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Progress</h3>
          <p className="text-sm text-gray-600">Monitor your learning progress and achievements.</p>
        </div>
      </div>

      {/* Login Form */}
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <Image 
                  src="/logo1.jpg" 
                  alt="Logo" 
                  width={300} 
                  height={300} 
                  className="rounded-2xl shadow-lg transform transition-all duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Sign in to continue your learning journey
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start animate-shake">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-5">
              <div className="transform transition-all duration-200 hover:translate-y-[-2px]">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-50 text-gray-900"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="transform transition-all duration-200 hover:translate-y-[-2px]">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-50 text-gray-900"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors duration-200" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors duration-200" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="transform transition-all duration-200 hover:translate-y-[-2px]">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <ArrowRight className={`h-5 w-5 text-indigo-100 transition-transform duration-200 ${loading ? '' : 'group-hover:translate-x-1'}`} />
                </span>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="flex items-center justify-center mt-6">
              <Link 
                href="/" 
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center gap-1 transition-colors group"
              >
                <ArrowRight className="h-4 w-4 transform transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Back to home</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Login Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
} 