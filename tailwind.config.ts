import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        'text-primary': '#ffffff',
        'text-secondary': '#888888',
        'text-muted': '#444444',
        border: '#333333',
        divider: '#1a1a1a',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        ui: ['Barlow Condensed', 'sans-serif'],
      },
      letterSpacing: {
        logo: '4px',
        button: '3px',
        label: '2px',
      },
      borderRadius: {
        DEFAULT: '0',
        none: '0',
      },
    },
  },
  plugins: [],
}

export default config
