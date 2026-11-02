import type { Config } from 'tailwindcss';
import { colors } from '@podiia/brand';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        light: colors.light,
        ground: colors.ground,
        carmine: colors.carmine,
        ink: colors.ink,
        stone: colors.stone,
        petal: colors.petal,
        muted: colors.muted,
      },
      fontFamily: {
        display: ['var(--font-unbounded)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-onest)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '24px', big: '32px' },
      keyframes: {
        draw: { '0%': { strokeDashoffset: '1' }, '60%,100%': { strokeDashoffset: '0' } },
        ripple: { '0%': { transform: 'scale(0.6)', opacity: '0.9' }, '100%': { transform: 'scale(1.6)', opacity: '0' } },
        stamp: { '0%': { transform: 'rotate(-12deg) scale(1.4)', opacity: '0' }, '100%': { transform: 'rotate(-12deg) scale(1)', opacity: '1' } },
      },
      animation: {
        draw: 'draw 3s ease-in-out infinite',
        ripple: 'ripple 0.9s ease-out forwards',
        stamp: 'stamp 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
