/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'cyber-blue': '#0066ff',
          'neon-pink': '#ff1493',
          'electric-purple': '#6a5acd',
          'matrix-green': '#00c851',
          'dark-void': '#ffffff',
          'light-gray': '#f8fafc',
          'glass-white': 'rgba(255, 255, 255, 0.8)',
          'glass-dark': 'rgba(255, 255, 255, 0.9)',
          'soft-blue': '#e3f2fd',
          'soft-pink': '#fce4ec',
          'soft-purple': '#f3e5f5',
          'soft-green': '#e8f5e8',
        },
        backgroundImage: {
          'cyber-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'neon-gradient': 'linear-gradient(45deg, #ff1493, #0066ff, #6a5acd)',
          'matrix-gradient': 'linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
          'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
          'light-gradient': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        },
        animation: {
          'float': 'float 6s ease-in-out infinite',
          'glow': 'glow 2s ease-in-out infinite alternate',
          'slide-up': 'slideUp 0.8s ease-out',
          'fade-in': 'fadeIn 1s ease-out',
          'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
          glow: {
            '0%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)' },
            '100%': { boxShadow: '0 0 30px rgba(0, 245, 255, 0.8)' },
          },
          slideUp: {
            '0%': { transform: 'translateY(100px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          pulseNeon: {
            '0%, 100%': { 
              textShadow: '0 0 5px rgba(0, 245, 255, 0.5), 0 0 10px rgba(0, 245, 255, 0.5), 0 0 15px rgba(0, 245, 255, 0.5)'
            },
            '50%': { 
              textShadow: '0 0 10px rgba(0, 245, 255, 0.8), 0 0 20px rgba(0, 245, 255, 0.8), 0 0 30px rgba(0, 245, 255, 0.8)'
            },
          },
        },
        backdropBlur: {
          xs: '2px',
        },
      },
    },
    plugins: [],
  }
  