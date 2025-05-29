/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // ← match everything under src
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          925: "rgb(7, 12, 23)", // ← your custom gray
        },
      },
    },
  },
  plugins: [],
};
