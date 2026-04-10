/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        dark: '#020617',
        primary: '#0f172a',
        border: '#1f2937',
        userMsg: '#2563eb',
        aiMsg: '#1e293b'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
