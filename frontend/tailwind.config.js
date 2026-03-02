/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // define custom keyframes and animation utilities used in index.css
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // match the class referenced in index.css
        fadeIn: 'fadeIn 0.3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
}
