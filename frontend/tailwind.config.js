/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chat: {
          dark: '#0f172a',      // Slate 900
          card: '#1e293b',      // Slate 800
          border: '#334155',    // Slate 700
          primary: '#6366f1',   // Indigo 500
          primaryHover: '#4f46e5', // Indigo 600
          secondary: '#a855f7', // Purple 500
          accent: '#06b6d4',    // Cyan 500
          success: '#10b981',   // Emerald 500
          textMuted: '#94a3b8',  // Slate 400
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
