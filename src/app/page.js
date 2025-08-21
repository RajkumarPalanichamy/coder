import Link from 'next/link';
import { Code, Users, Trophy, BookOpen, Zap, Brain, TrendingUp, Award } from 'lucide-react';
import Image from 'next/image';
import './landing.css';

export default function Home() {
  return (
    <div className="landing-page bg-gradient-subtle min-h-screen">
      {/* Navigation */}
      <nav className="nav-professional fixed w-full z-50">
        <div className="container">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                src="/logo.jpg" 
                alt="Logo" 
                width={40} 
                height={40} 
                className="h-10 w-10 rounded-lg shadow-soft" 
              />
              <span className="ml-3 text-2xl font-bold text-dark">
                Zenith Mentor
              </span>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding pt-32">
        <div className="container">
          <div className="text-center animate-fade-in">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-primary text-white text-sm font-semibold rounded-full">
                🚀 Professional Coding Education
              </span>
            </div>

            <h1 className="heading-xl text-dark">
              <span className="block">Master Coding with</span>
              <span className="block gradient-text-primary">
                Expert Mentorship
              </span>
            </h1>

            <p className="text-lg text-gray-medium max-w-3xl mx-auto mb-8 animate-slide-up">
              Advance your programming skills through personalized mentorship, 
              structured challenges, and comprehensive learning paths designed for 
              professional growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
              <Link
                href="/login"
                className="btn-primary flex items-center"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Learning
              </Link>

              <div className="flex items-center space-x-6 text-gray-light">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                  <span className="text-sm">Expert-Led</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <span className="text-sm">Structured</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                  <span className="text-sm">Results-Driven</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-dark rounded-professional p-8 max-w-4xl mx-auto animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="icon-container icon-primary mx-auto">
                    <Brain className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-2">5,000+</h3>
                  <p className="text-gray-medium">Students Mentored</p>
                </div>
                <div>
                  <div className="icon-container icon-secondary mx-auto">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-2">95%</h3>
                  <p className="text-gray-medium">Success Rate</p>
                </div>
                <div>
                  <div className="icon-container icon-accent mx-auto">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-2">500+</h3>
                  <p className="text-gray-medium">Career Advances</p>
                </div>
              </div>
              <div className="accent-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gradient-secondary text-white text-sm font-semibold rounded-full mb-6">
              ⚡ Core Features
            </div>
            <h2 className="heading-lg text-dark mb-6">
              <span className="gradient-text-secondary">Comprehensive Learning</span>
              <br />
              <span className="text-dark">Platform</span>
            </h2>
            <p className="text-lg text-gray-medium max-w-3xl mx-auto">
              Everything you need to advance your coding skills and accelerate your career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <div className="professional-card hover-lift text-center">
              <div className="icon-container icon-primary">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="heading-md text-dark">Structured Challenges</h3>
              <p className="text-gray-medium leading-relaxed">
                Progressive coding challenges designed to build your skills systematically from beginner to advanced levels.
              </p>
              <div className="mt-4 flex items-center justify-center text-primary text-sm font-semibold">
                <span>Level 1 - 3</span>
                <Zap className="w-4 h-4 ml-2" />
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="professional-card hover-lift text-center">
              <div className="icon-container icon-secondary">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="heading-md text-dark">Progress Tracking</h3>
              <p className="text-gray-medium leading-relaxed">
                Comprehensive analytics and progress tracking to monitor your improvement and identify areas for growth.
              </p>
              <div className="mt-4 flex items-center justify-center text-secondary text-sm font-semibold">
                <span>Real-time Analytics</span>
                <Brain className="w-4 h-4 ml-2" />
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="professional-card hover-lift text-center">
              <div className="icon-container icon-accent">
                <Code className="w-8 h-8" />
              </div>
              <h3 className="heading-md text-dark">Multi-Language Support</h3>
              <p className="text-gray-medium leading-relaxed">
                Learn and practice with JavaScript, Python, Java, C++, and C through our integrated development environment.
              </p>
              <div className="mt-4 flex items-center justify-center text-accent text-sm font-semibold">
                <span>5+ Languages</span>
                <Code className="w-4 h-4 ml-2" />
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="professional-card hover-lift text-center">
              <div className="icon-container icon-neutral">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="heading-md text-dark">Expert Mentorship</h3>
              <p className="text-gray-medium leading-relaxed">
                Get personalized guidance from experienced mentors who provide feedback and career advice.
              </p>
              <div className="mt-4 flex items-center justify-center text-gray-medium text-sm font-semibold">
                <span>24/7 Support</span>
                <Users className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-professional">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-6">
                <Image 
                  src="/logo.jpg" 
                  alt="Logo" 
                  width={48} 
                  height={48} 
                  className="h-12 w-12 rounded-lg shadow-soft" 
                />
                <span className="ml-3 text-2xl font-bold text-dark">
                  Zenith Mentor
                </span>
              </div>
              <p className="text-gray-medium leading-relaxed">
                Empowering developers through professional mentorship and 
                <span className="text-primary font-semibold"> structured learning paths</span>.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="heading-md text-dark mb-6">Learning Paths</h3>
              <div className="space-y-3">
                <Link href="/login" className="block text-gray-medium hover:text-primary transition-colors duration-300">
                  Get Started
                </Link>
                <Link href="/problems" className="block text-gray-medium hover:text-secondary transition-colors duration-300">
                  Practice Problems
                </Link>
                <Link href="/dashboard" className="block text-gray-medium hover:text-accent transition-colors duration-300">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Contact Section */}
            <div className="text-center md:text-right">
              <h3 className="heading-md text-dark mb-6">Connect</h3>
              <div className="flex justify-center md:justify-end space-x-4 mb-6">
                <div className="icon-container icon-primary hover-scale cursor-pointer">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="icon-container icon-secondary hover-scale cursor-pointer">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="icon-container icon-accent hover-scale cursor-pointer">
                  <Code className="w-5 h-5" />
                </div>
              </div>
              <p className="text-gray-medium text-sm">
                Status: <span className="text-accent font-semibold">● Active</span>
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-soft">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-light text-sm mb-4 md:mb-0">
                &copy; 2024 Zenith Mentor. All rights reserved. 
                <span className="text-primary"> Professional Development Platform</span>
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-light">
                <span>Platform Status:</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                  <span className="text-accent font-medium">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}