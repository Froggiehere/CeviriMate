export default {
  darkMode: 'class', // Enables dark mode with a 'dark' class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E4174',  // Primary color
        accent: '#DDA94B',   // Accent color
      },
    },
  },
  plugins: [],
};
