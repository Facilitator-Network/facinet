import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
        sans: ["var(--font-body)"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
          subtle: "var(--accent-subtle)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        "neon-blue": "var(--neon-blue)",
        "neon-purple": "var(--neon-purple)",
        "neon-pink": "var(--neon-pink)",
        // Design system surface colors
        surface: {
          void: "var(--bg-void)",
          DEFAULT: "var(--bg-surface)",
          raised: "var(--bg-raised)",
          code: "var(--bg-code)",
        },
        // Design system text colors
        "ds-text": {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        // Semantic colors
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
          border: "var(--success-border)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-bg)",
          border: "var(--warning-border)",
        },
        error: {
          DEFAULT: "var(--error)",
          bg: "var(--error-bg)",
          border: "var(--error-border)",
        },
        info: "var(--info)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        /* M3 Shape Scale */
        "md-none": "var(--md-sys-shape-none)",
        "md-xs": "var(--md-sys-shape-extra-small)",
        "md-sm": "var(--md-sys-shape-small)",
        "md-md": "var(--md-sys-shape-medium)",
        "md-lg": "var(--md-sys-shape-large)",
        "md-xl": "var(--md-sys-shape-extra-large)",
        "md-full": "var(--md-sys-shape-full)",
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
        "ds-sm": "var(--shadow-sm)",
        "ds-md": "var(--shadow-md)",
        /* M3 Elevation */
        "md-0": "var(--md-sys-elevation-0)",
        "md-1": "var(--md-sys-elevation-1)",
        "md-2": "var(--md-sys-elevation-2)",
        "md-3": "var(--md-sys-elevation-3)",
        "md-4": "var(--md-sys-elevation-4)",
        "md-5": "var(--md-sys-elevation-5)",
      },
      transitionTimingFunction: {
        "md-standard": "var(--md-sys-motion-easing-standard)",
        "md-standard-decel": "var(--md-sys-motion-easing-standard-decelerate)",
        "md-standard-accel": "var(--md-sys-motion-easing-standard-accelerate)",
        "md-emphasized": "var(--md-sys-motion-easing-emphasized)",
        "md-emphasized-decel": "var(--md-sys-motion-easing-emphasized-decelerate)",
        "md-emphasized-accel": "var(--md-sys-motion-easing-emphasized-accelerate)",
      },
      transitionDuration: {
        "md-short1": "var(--md-sys-motion-duration-short1)",
        "md-short2": "var(--md-sys-motion-duration-short2)",
        "md-short3": "var(--md-sys-motion-duration-short3)",
        "md-short4": "var(--md-sys-motion-duration-short4)",
        "md-medium1": "var(--md-sys-motion-duration-medium1)",
        "md-medium2": "var(--md-sys-motion-duration-medium2)",
        "md-medium3": "var(--md-sys-motion-duration-medium3)",
        "md-medium4": "var(--md-sys-motion-duration-medium4)",
        "md-long1": "var(--md-sys-motion-duration-long1)",
        "md-long2": "var(--md-sys-motion-duration-long2)",
      },
    },
  },
  plugins: [],
};

export default config;
