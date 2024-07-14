/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        md: ['15px', '22px']
      }
    }
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')]
};
