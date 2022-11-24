/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line header/header
module.exports = {
  content: [
    './packages/extension/src/**/*.{html,js,jsx,ts,tsx}',
    './packages/extension/public/**/*.{html,js}',
    './packages/extension-ui/**/*.{html,js,jsx,ts,tsx}'
  ],
  plugins: [],
  theme: {
    extend: {}
  }
};
