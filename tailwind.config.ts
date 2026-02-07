import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        mumtaz: {
          lilac: "hsl(var(--mumtaz-lilac))",
          sage: "hsl(var(--mumtaz-sage))",
          plum: "hsl(var(--mumtaz-plum))",
          sand: "hsl(var(--mumtaz-sand))",
          "warm-white": "hsl(var(--mumtaz-warm-white))",
        },
        dosha: {
          pitta: "hsl(var(--dosha-pitta))",
          vata: "hsl(var(--dosha-vata))",
          kapha: "hsl(var(--dosha-kapha))",
        },
        wellness: {
          sage: "hsl(var(--mumtaz-sage))",
          "sage-light": "hsl(100 20% 90%)",
          lilac: "hsl(var(--mumtaz-lilac))",
          "lilac-light": "hsl(280 40% 92%)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        // UX Audit: Use Roboto/Open Sans for maximum legibility
        sans: ['Open Sans', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body: ['Open Sans', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        accent: ['Nunito', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      // UX Audit: Accessibility-compliant font size scale (18px base)
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.5' }],      // 14px - helper text minimum
        'sm': ['1rem', { lineHeight: '1.5' }],          // 16px - captions
        'base': ['1.125rem', { lineHeight: '1.6' }],    // 18px - body text (WCAG compliant)
        'lg': ['1.25rem', { lineHeight: '1.5' }],       // 20px - emphasized text
        'xl': ['1.375rem', { lineHeight: '1.4' }],      // 22px - H4
        '2xl': ['1.625rem', { lineHeight: '1.3' }],     // 26px - H3
        '3xl': ['2rem', { lineHeight: '1.2' }],         // 32px - H2
        '4xl': ['2.5rem', { lineHeight: '1.1' }],       // 40px - H1
        '5xl': ['3rem', { lineHeight: '1.1' }],         // 48px - Display
      },
      // UX Audit: Touch target spacing (44px minimum)
      spacing: {
        'touch': '2.75rem',      // 44px - minimum touch target
        'touch-lg': '3rem',      // 48px - comfortable touch target
        'touch-xl': '3.5rem',    // 56px - large touch target (nav items)
      },
      // UX Audit: Minimum touch target sizes
      minHeight: {
        'touch': '2.75rem',      // 44px
        'touch-lg': '3rem',      // 48px
        'input': '3rem',         // 48px for form inputs
      },
      minWidth: {
        'touch': '2.75rem',      // 44px
        'btn': '7.5rem',         // 120px - primary button minimum
        'btn-sm': '6.25rem',     // 100px - secondary button minimum
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
        "pulse-gentle": {
          "0%, 100%": { 
            opacity: "1",
            transform: "scale(1)"
          },
          "50%": { 
            opacity: "0.95",
            transform: "scale(1.02)"
          }
        },
        "loading-bar": {
          "0%": {
            transform: "translateX(-100%)",
            width: "30%"
          },
          "50%": {
            transform: "translateX(50%)",
            width: "50%"
          },
          "100%": {
            transform: "translateX(200%)",
            width: "30%"
          }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-gentle": "pulse-gentle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "loading-bar": "loading-bar 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
