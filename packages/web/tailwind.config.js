/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        golf: {
          green: {
            50: '#f0f7f4',
            100: '#d9ede3',
            200: '#b5dbc9',
            300: '#85c3a6',
            400: '#56a880',
            500: '#358d64',
            600: '#267150',
            700: '#1B4D3E',
            800: '#1a4435',
            900: '#16382c',
            950: '#0c1f19',
          },
          gold: {
            50: '#fdf9ef',
            100: '#f9efd4',
            200: '#f2dca5',
            300: '#eac76e',
            400: '#C4A35A',
            500: '#d4a233',
            600: '#bc8524',
            700: '#9c6620',
            800: '#805120',
            900: '#6a431e',
          },
          sand: '#F5F0E8',
          fairway: '#2D5A27',
          rough: '#4A7C59',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #1B4D3E 0%, #2D5A27 50%, #1B4D3E 100%)',
      },
    },
  },
  plugins: [],
};
