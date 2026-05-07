/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte impériale — Cahier des Charges Titulus Civilis §3.1
        'noir': '#0A0A0A',           // Noir impérial — fond principal
        'noir-2': '#141414',          // Noir secondaire — cards
        'or': '#C9A84C',              // Or principal — accents, CTA
        'or-pale': '#E8D9A8',         // Or pâle — sous-titres italiques
        'or-terne': '#5A4D2A',        // Or terne — étapes futures
        'cardinal': '#8C1E1E',        // Rouge cardinal — DUDH Art. 15
        'parchemin': '#F4ECD8',       // Parchemin — fond Declaratio
        'parchemin-2': '#F0E4C4',     // Parchemin teinté — encart Primum Non Nocere
        'charcoal': '#1E2A3B',        // Charcoal — titres sur parchemin
        'texte-clair': '#EDE5D0',     // Texte clair — corps sur noir
        'texte-muet': '#8A7E63',      // Texte muet — copyright
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'imperial': '0.15em',
        'imperial-wide': '0.18em',
        'imperial-tight': '0.08em',
        'imperial-cta': '0.12em',
      },
      boxShadow: {
        'or': '0 0 0 1px rgba(201,168,76,0.4)',
        'or-strong': '0 0 0 1px rgba(201,168,76,0.7), 0 0 24px rgba(201,168,76,0.18)',
        'halo-or': '0 0 60px rgba(201,168,76,0.35)',
      },
      backgroundImage: {
        'gradient-or': 'linear-gradient(135deg, #C9A84C 0%, #E8D9A8 50%, #C9A84C 100%)',
      },
      animation: {
        'pulse-or': 'pulse-or 2.4s ease-in-out infinite',
        'live-blink': 'live-blink 1.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out',
        'armoiries-float': 'armoiries-float 7s ease-in-out infinite',
      },
      keyframes: {
        'pulse-or': {
          '0%, 100%': { boxShadow: '0 0 30px rgba(201,168,76,0.25)' },
          '50%': { boxShadow: '0 0 70px rgba(201,168,76,0.55)' },
        },
        'live-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'armoiries-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(-0.5deg)' },
          '50%': { transform: 'translateY(-12px) rotate(0.5deg)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
