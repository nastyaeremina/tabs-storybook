/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Figma Tab tokens
        'text-primary': '#212B36',
        'text-secondary': '#6B6F76',
        'text-disabled': '#90959D',
        'tab-border': '#DFE1E4',
        'tab-hover': '#F8F9FB',
      },
      boxShadow: {
        // Matches the design system's `popover-50` shadow token.
        'popover-50': '0px 6px 20px 0px rgba(0, 0, 0, 0.07)',
      },
    },
  },
  plugins: [],
};
