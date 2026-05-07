/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070d',
          900: '#0a1024',
          800: '#101a35',
          700: '#192246',
          600: '#243056',
        },
        royal: {
          400: '#5b8bff',
          500: '#3461ff',
          600: '#2347d9',
          700: '#1a37b0',
        },
        paper: {
          DEFAULT: '#e6ecff',
          muted: '#8694b8',
          dim: '#566688',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      fontSize: {
        hero: ['3.5rem', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '700' }],
        stat: ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '700' }],
      },
      backgroundImage: {
        'gradient-card':
          'linear-gradient(160deg, rgba(52,97,255,0.06) 0%, rgba(16,26,53,0) 60%)',
        'gradient-hero': 'linear-gradient(180deg, #101a35 0%, #0a1024 100%)',
        'gradient-royal': 'linear-gradient(135deg, #3461ff 0%, #1a37b0 100%)',
      },
      boxShadow: {
        soft:
          '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow:
          '0 0 0 1px rgba(91,139,255,0.3), 0 0 32px -8px rgba(52,97,255,0.4)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};
