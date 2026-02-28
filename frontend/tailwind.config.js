/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0A0A0A', hover: '#262626' },
        muted: '#6B7280',
        border: '#E5E7EB',
        success: '#16A34A',
        cardbg: '#FFFFFF'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        hero: ['80px', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        h2: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }]
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
        modal: '0 24px 64px rgba(0,0,0,0.12)',
        hero: '0 24px 64px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        card: '12px',
        pill: '99px',
        modal: '16px'
      }
    }
  },
  plugins: [],
}
