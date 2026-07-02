/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './script.js'],
  theme: {
    // Fluid type scale (clamp between 375px and 1280px viewports).
    // Raised floor: no substantive copy below ~14px; labels bottom out at 13px.
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.5' }],
      sm: ['clamp(0.875rem, 0.8rem + 0.32vw, 0.9375rem)', { lineHeight: '1.65' }],
      base: ['clamp(1rem, 0.95rem + 0.21vw, 1.0625rem)', { lineHeight: '1.65' }],
      lg: ['clamp(1.0625rem, 1rem + 0.27vw, 1.1875rem)', { lineHeight: '1.55' }],
      xl: ['clamp(1.1875rem, 1.11rem + 0.35vw, 1.375rem)', { lineHeight: '1.4' }],
      '2xl': ['clamp(1.375rem, 1.21rem + 0.71vw, 1.75rem)', { lineHeight: '1.3' }],
      '3xl': ['clamp(1.625rem, 1.4rem + 0.94vw, 2.125rem)', { lineHeight: '1.2' }],
      '4xl': ['clamp(1.875rem, 1.6rem + 1.18vw, 2.5rem)', { lineHeight: '1.12' }],
      '5xl': ['clamp(2.5rem, 2.06rem + 1.88vw, 3.5rem)', { lineHeight: '1.05' }],
      '6xl': ['clamp(2.875rem, 2.16rem + 3.06vw, 4.5rem)', { lineHeight: '1.02' }]
    },
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
