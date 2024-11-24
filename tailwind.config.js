/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Add paths to your React components
    './public/index.html', // Include your index.html file if necessary
    './node_modules/@ionic/react/**/*.js', // Include Ionic components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
