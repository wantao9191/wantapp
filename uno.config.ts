import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),  
    presetAttributify(),
    presetIcons(),
  ],
  theme: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#6b7280',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      }
    },
    boxShadow: {
      'login': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      'form': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
    },
    animation: {
      'fade-in': 'fadeIn 0.6s ease-in-out',
      'slide-up': 'slideUp 0.5s ease-out',
      'float': 'float 6s ease-in-out infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      slideUp: {
        '0%': { opacity: '0', transform: 'translateY(30px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
    },
  },
  shortcuts: {
    'btn': 'px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105',
    'btn-primary': 'btn bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl',
    'card': 'bg-white/80 backdrop-blur-lg rounded-2xl shadow-login border border-white/20',
    'input-modern': 'rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-300',
    'glass': 'bg-white/10 backdrop-blur-md border border-white/20',
    'gradient-bg': 'bg-gradient-to-br from-primary-50 via-white to-primary-100',
  },
});