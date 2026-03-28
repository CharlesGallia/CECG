/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: '#111111',
        or: '#B8960C',
        blanc: '#FFFFFF',
        'or-clair': '#F5EED4',
        'or-fonce': '#7A620A',
        'gris-clair': '#F5F5F5',
        'gris': '#E5E5E5',
        'gris-texte': '#666666',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
