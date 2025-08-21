import Link from 'next/link';
import { Code, Users, Trophy, BookOpen, Zap, Brain, Cpu, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-matrix-gradient relative overflow-hidden">
      {/* Animated Particle Background */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="glass-dark fixed w-full z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group">
              <div className="relative">
                <Image 
                  src="/logo.jpg" 
                  alt="Logo" 
                  width={40} 
                  height={40} 
                  className="h-10 w-10 rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 rounded-lg bg-cyber-blue opacity-20 animate-pulse"></div>
              </div>
              <span className="ml-3 text-2xl font-bold text-white neon-text animate-pulse-neon">
                Zenith Mentor
              </span>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login"
                className="relative px-6 py-2 bg-gradient-to-r from-cyber-blue to-electric-purple text-white font-semibold rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,245,255,0.5)]"
              >
                <span className="relative z-10">Enter the Matrix</span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-pink to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            {/* Floating geometric shapes */}
            <div className="absolute top-10 left-10 w-20 h-20 border border-cyber-blue rounded-lg animate-float opacity-30"></div>
            <div className="absolute top-32 right-20 w-16 h-16 border border-neon-pink rounded-full animate-float opacity-40" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-electric-purple rounded-lg animate-float opacity-50" style={{animationDelay: '4s'}}></div>

            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-cyber-blue to-electric-purple text-white text-sm font-semibold rounded-full animate-pulse">
                🚀 Next-Gen Coding Education
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 animate-slide-up">
              <span className="block">Transcend Your</span>
              <span className="block bg-gradient-to-r from-cyber-blue via-neon-pink to-electric-purple bg-clip-text text-transparent animate-pulse-neon">
                Coding Reality
              </span>
              <span className="block text-4xl sm:text-5xl lg:text-6xl mt-2">
                with <span className="neon-text">Zenith Mentor</span>
              </span>
            </h1>

            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed animate-slide-up" style={{animationDelay: '0.3s'}}>
              Enter a dimension where artificial intelligence meets human expertise. 
              Master coding through immersive challenges, AI-powered feedback, and 
              <span className="text-cyber-blue font-semibold"> quantum-leap learning experiences</span>.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{animationDelay: '0.6s'}}>
              <Link
                href="/login"
                className="group relative px-8 py-4 bg-gradient-to-r from-cyber-blue to-electric-purple text-white font-bold text-lg rounded-xl overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-[0_0_50px_rgba(0,245,255,0.6)] transform hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center">
                  <Zap className="w-6 h-6 mr-2" />
                  Initialize Protocol
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-neon-pink via-electric-purple to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>

              <div className="flex items-center space-x-6 text-gray-400">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-matrix-green rounded-full animate-pulse mr-2"></div>
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-cyber-blue rounded-full animate-pulse mr-2"></div>
                  <span>Real-time</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-neon-pink rounded-full animate-pulse mr-2"></div>
                  <span>Adaptive</span>
                </div>
              </div>
            </div>

            {/* Holographic display effect */}
            <div className="mt-16 relative">
              <div className="glass-dark rounded-2xl p-8 max-w-4xl mx-auto animate-slide-up" style={{animationDelay: '0.9s'}}>
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div className="group">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyber-blue to-electric-purple rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:animate-spin transition-all duration-300">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">10K+</h3>
                    <p className="text-gray-400">Neural Pathways</p>
                  </div>
                  <div className="group">
                    <div className="w-16 h-16 bg-gradient-to-r from-neon-pink to-cyber-blue rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:animate-bounce transition-all duration-300">
                      <Cpu className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">99.9%</h3>
                    <p className="text-gray-400">Success Rate</p>
                  </div>
                  <div className="group">
                    <div className="w-16 h-16 bg-gradient-to-r from-electric-purple to-neon-pink rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:animate-pulse transition-all duration-300">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">∞</h3>
                    <p className="text-gray-400">Possibilities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-electric-purple to-cyber-blue text-white text-sm font-bold rounded-full mb-6 animate-pulse">
              ⚡ QUANTUM FEATURES
            </div>
            <h2 className="text-5xl font-extrabold text-white mb-6">
              <span className="bg-gradient-to-r from-cyber-blue to-neon-pink bg-clip-text text-transparent">
                Neural Network
              </span>
              <br />
              <span className="neon-text">Learning Modules</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of coding education through our AI-enhanced learning ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Card 1 */}
            <div className="group relative">
              <div className="glass-dark rounded-2xl p-8 h-full transform transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(0,245,255,0.3)] border border-cyber-blue/30">
                <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/10 to-electric-purple/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyber-blue to-electric-purple rounded-xl flex items-center justify-center mb-6 group-hover:animate-spin transition-all duration-300">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 neon-text">Quantum Problems</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Dive into multi-dimensional coding challenges that adapt to your skill level in real-time using advanced AI algorithms.
                  </p>
                  <div className="mt-6 flex items-center text-cyber-blue text-sm font-semibold">
                    <span>Level 1 → ∞</span>
                    <Zap className="w-4 h-4 ml-2 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative">
              <div className="glass-dark rounded-2xl p-8 h-full transform transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-[0_20px_50px_rgba(255,0,128,0.3)] border border-neon-pink/30">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 to-cyber-blue/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-neon-pink to-cyber-blue rounded-xl flex items-center justify-center mb-6 group-hover:animate-bounce transition-all duration-300">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 neon-text">Neural Analytics</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Witness your progress through holographic visualizations and quantum-enhanced performance metrics.
                  </p>
                  <div className="mt-6 flex items-center text-neon-pink text-sm font-semibold">
                    <span>Real-time Insights</span>
                    <Brain className="w-4 h-4 ml-2 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative">
              <div className="glass-dark rounded-2xl p-8 h-full transform transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(138,43,226,0.3)] border border-electric-purple/30">
                <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/10 to-neon-pink/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-electric-purple to-neon-pink rounded-xl flex items-center justify-center mb-6 group-hover:animate-pulse transition-all duration-300">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 neon-text">Omni-Language</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Master JavaScript, Python, Java, C++, and C through our universal coding interface with AI assistance.
                  </p>
                  <div className="mt-6 flex items-center text-electric-purple text-sm font-semibold">
                    <span>5+ Languages</span>
                    <Cpu className="w-4 h-4 ml-2 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="group relative">
              <div className="glass-dark rounded-2xl p-8 h-full transform transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-[0_20px_50px_rgba(0,255,65,0.3)] border border-matrix-green/30">
                <div className="absolute inset-0 bg-gradient-to-br from-matrix-green/10 to-cyber-blue/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-matrix-green to-cyber-blue rounded-xl flex items-center justify-center mb-6 group-hover:animate-spin transition-all duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 neon-text">AI Mentorship</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Connect with quantum-enhanced AI mentors and human experts for personalized guidance on your coding odyssey.
                  </p>
                  <div className="mt-6 flex items-center text-matrix-green text-sm font-semibold">
                    <span>24/7 Guidance</span>
                    <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional floating elements */}
          <div className="absolute top-20 right-10 w-32 h-32 border-2 border-cyber-blue/20 rounded-full animate-float opacity-30"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 border-2 border-neon-pink/20 rounded-lg animate-float opacity-40" style={{animationDelay: '3s'}}></div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-t from-dark-void to-matrix-gradient border-t border-cyber-blue/20">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          {/* Glowing divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-6">
                <Image 
                  src="/logo.jpg" 
                  alt="Logo" 
                  width={48} 
                  height={48} 
                  className="h-12 w-12 rounded-xl shadow-lg" 
                />
                <span className="ml-3 text-3xl font-bold text-white neon-text">
                  Zenith Mentor
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Transcending the boundaries of traditional coding education through 
                <span className="text-cyber-blue font-semibold"> quantum-enhanced learning</span>.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-6 neon-text">Neural Pathways</h3>
              <div className="space-y-3">
                <Link href="/login" className="block text-gray-300 hover:text-cyber-blue transition-colors duration-300 hover:animate-pulse">
                  Access Portal
                </Link>
                <Link href="/problems" className="block text-gray-300 hover:text-neon-pink transition-colors duration-300 hover:animate-pulse">
                  Quantum Challenges
                </Link>
                <Link href="/dashboard" className="block text-gray-300 hover:text-electric-purple transition-colors duration-300 hover:animate-pulse">
                  Neural Dashboard
                </Link>
              </div>
            </div>

            {/* Connect Section */}
            <div className="text-center md:text-right">
              <h3 className="text-xl font-bold text-white mb-6 neon-text">Connect to the Matrix</h3>
              <div className="flex justify-center md:justify-end space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyber-blue to-electric-purple rounded-xl flex items-center justify-center hover:animate-spin transition-all duration-300 cursor-pointer">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-neon-pink to-cyber-blue rounded-xl flex items-center justify-center hover:animate-bounce transition-all duration-300 cursor-pointer">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-electric-purple to-neon-pink rounded-xl flex items-center justify-center hover:animate-pulse transition-all duration-300 cursor-pointer">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                Status: <span className="text-matrix-green animate-pulse">● Online</span>
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-cyber-blue/20">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; 2024 Zenith Mentor. All rights reserved. 
                <span className="text-cyber-blue"> Powered by Quantum AI</span>
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>System Status:</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse mr-2"></div>
                  <span className="text-matrix-green">Optimal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-20 h-20 border border-cyber-blue/20 rounded-full animate-float opacity-20"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 border border-neon-pink/20 rounded-lg animate-float opacity-30" style={{animationDelay: '2s'}}></div>
        </div>
      </footer>
    </div>
  );
}
