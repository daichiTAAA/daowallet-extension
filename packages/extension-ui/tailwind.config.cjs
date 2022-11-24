/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line header/header
module.exports = {
  content: [
    '../extension/public/**/*.{html,js}',
    '../extension/src/**/*.{html,js,jsx,ts,tsx}',
    './src/**/*.{html,js,jsx,ts,tsx}'
  ],
  plugins: [],
  theme: {
    extend: {}
  }
};
