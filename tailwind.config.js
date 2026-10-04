/**
 * Paleta corporativa Pura Vida Sana
 * Tailwind v4 usa @theme en globals.css; este archivo documenta tokens.
 *
 * Verde Principal (Bosque): #184D28
 * Verde Secundario (Hoja):  #6EB43F  (complementa el logo sin igualarlo)
 * Verde Claro / Soft:       #F2F8EE
 * Neutro Oscuro:            #1C241E
 * Neutro Blanco/Gris:       #FFFFFF / #F9FAFB
 * Dorado Acento (Gold):     #D97706
 */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: "#184D28",
        leaf: "#6EB43F",
        soft: "#F2F8EE",
        ink: "#1C241E",
        surface: "#F9FAFB",
        gold: "#D97706",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
        script: ["var(--font-kaushan)", "cursive"],
        display: ["var(--font-fredoka)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
