/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores de marca de AVE Paraíso
        'ave-cielo': '#9DD3EE',       // el azul de sus volantes: superficie de marca
        'ave-cielo-claro': '#EAF6FC', // fondos de sección alternos
        'ave-rojo': '#D62839',        // la cresta del gallo: solo acciones
        'ave-oscuro': '#16263D',      // texto
        'ave-blanco': '#FFFFFF',
        // Se conservan por compatibilidad con componentes anteriores
        'ave-azul': '#9DD3EE',
        'ave-azul-claro': '#EAF6FC',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
