/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        bullish: 'hsl(var(--bullish))',
        bearish: 'hsl(var(--bearish))',
        alert: 'hsl(var(--alert))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'ticker-move': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3)' },
        },
        'signal-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,230,230,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(0,230,230,0.5)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'ticker': 'ticker-move 30s linear infinite',
        'live-pulse': 'live-pulse 1.5s ease-in-out infinite',
        'signal-glow': 'signal-glow 2s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(180 90% 50%), hsl(200 90% 55%))',
        'gradient-bullish': 'linear-gradient(135deg, hsl(160 84% 48%), hsl(160 70% 40%))',
        'gradient-bearish': 'linear-gradient(135deg, hsl(350 85% 58%), hsl(350 70% 45%))',
        'gradient-card': 'linear-gradient(145deg, hsl(222 40% 9%), hsl(222 35% 7%))',
        'gradient-terminal': 'linear-gradient(180deg, hsl(222 47% 4%) 0%, hsl(222 47% 6%) 100%)',
      },
      boxShadow: {
        'elegant': '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
        'glow': '0 0 20px rgba(0, 230, 230, 0.15), 0 0 40px rgba(0,230,230,0.05)',
        'glow-bullish': '0 0 20px rgba(52, 211, 153, 0.2)',
        'glow-bearish': '0 0 20px rgba(248, 113, 113, 0.2)',
        'glow-alert': '0 0 20px rgba(251, 191, 36, 0.25)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'text-bullish', 'text-bearish', 'text-alert',
    'bg-bullish', 'bg-bearish', 'bg-alert',
    'border-bullish', 'border-bearish',
    'glow-bullish', 'glow-bearish',
    'shadow-glow-bullish', 'shadow-glow-bearish', 'shadow-glow-alert',
  ],
};
