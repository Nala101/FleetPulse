/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f0f0",
          100: "#c0d9da",
          200: "#99c3c4",
          300: "#73adad",
          400: "#4d9697",
          500: "#3C6E71", // Main stormyTeal buttons, links, highlights
          600: "#33585c",
          700: "#2a4347",
          800: "#213031",
          900: "#181b1c",
        },
        secondary: {
          50: "#e6edf0",
          100: "#c1cdda",
          200: "#9db0c4",
          300: "#7893ad",
          400: "#547699",
          500: "#284B63", // Complementary color yaleBlue 
          600: "#213c52",
          700: "#192d3c",
          800: "#111f27",
          900: "#091014",
        },
        background: {
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#cccccc",
          300: "#b8b8b8",
          400: "#a3a3a3",
          500: "#353535", // base white 
          600: "#2c2c2c",
          700: "#222222",
          800: "#191919",
          900: "#0f0f0f",
        },
        neutral: {
          50: "#ffffff",
          100: "#fefefe",
          200: "#fcfcfc",
          300: "#fafafa",
          400: "#f7f7f7",
          500: "#FFFFFF", // graphite 
          600: "#e6e6e6",
          700: "#cccccc",
          800: "#b3b3b3",
          900: "#999999",
        },
        surface: {
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#d9d9d9", // alabasterGrey 
          300: "#c0c0c0",
          400: "#a8a8a8",
          500: "#D9D9D9",
          600: "#b0b0b0", // this one fits nicely with the color as a secondary color to
          700: "#888888",
          800: "#606060",
          900: "#383838",
        },
      },
    },
  },
  plugins: [],
};

