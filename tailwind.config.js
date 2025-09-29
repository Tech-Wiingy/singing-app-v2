/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'figtree': ['Figtree', 'system-ui', 'sans-serif'],
      },
      colors: {
        content: {
          primary: '#222222',
          secondary: '#6a6a6a',
          disabled: '#b0b0b0',
          inverted: '#dddddd',
        },
        surface: {
          primary: '#ffffff',
          secondary: '#f7f7f7',
          inverted: '#222222',
        },
        brand: {
          primary: '#2655A3',
        }
      },
      fontSize: {
        'xs': ['0.5rem', '0.75rem'],    // 8px/12px
        'sm': ['0.75rem', '1rem'],      // 12px/16px
        'base': ['1rem', '1.5rem'],     // 16px/24px
        'lg': ['1.125rem', '1.75rem'],  // 18px/28px
        'xl': ['1.25rem', '1.75rem'],   // 20px/28px
        '2xl': ['2rem', '2.25rem'],     // 32px/36px (main title)
      }
    },
  },
  plugins: [],
}








