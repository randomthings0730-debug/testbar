
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        viviola: '#AC92B6',
        royalHigh: '#715D77',
        royalDignity: '#B08DBE',
        amurLilac: '#E6D8E6',
        bellOfLove: '#F6F0F6',
        grapeBottle: '#8D7694',
        sunlight: '#FFF9E6',
        buttery: '#FFD97D',
        ochre: '#B48A4E',
        primary: '#715D77',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
