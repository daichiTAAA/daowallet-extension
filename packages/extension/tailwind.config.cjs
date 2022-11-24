/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line header/header
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './public/**/*.{html,js}',
    '../extension-ui/**/*.{html,js,jsx,ts,tsx}'
  ],
  plugins: [],
  theme: {
    extend: {}
  }
};
