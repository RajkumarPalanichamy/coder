/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'cyber-blue': '#00f5ff',
          'neon-pink': '#ff0080',
          'electric-purple': '#8a2be2',
          'matrix-green': '#00ff41',
          'dark-void': '#0a0a0a',
          'glass-white': 'rgba(255, 255, 255, 0.1)',
          'glass-dark': 'rgba(0, 0, 0, 0.2)',
        },
        backgroundImage: {
          'cyber-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'neon-gradient': 'linear-gradient(45deg, #ff0080, #00f5ff, #8a2be2)',
          'matrix-gradient': 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
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
  