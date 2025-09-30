/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'geist-sans': ['var(--font-geist-sans)', 'Arial', 'sans-serif'],
        'geist-mono': ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}