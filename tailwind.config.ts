import type { Config } from "tailwindcss";

/**
 * Al Malak design system — palette derived from the brand logo:
 *  - Sage / olive green (primary)
 *  - Rose / blossom pink (accent)
 *  - Warm cream (surface)
 *  - Champagne gold (highlight)
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FEFCF9",
          100: "#FAF6EF",
          200: "#F3ECE0",
          300: "#E9DEC9",
        },
        sage: {
          50: "#F3F5EE",
          100: "#E3E8D5",
          200: "#C6D0AC",
          300: "#A6B581",
          400: "#899A60",
          500: "#6F8049", // primary
          600: "#5A6A3A",
          700: "#46522E",
          800: "#343D23",
          900: "#252C19",
        },
        blossom: {
          50: "#FDF2F5",
          100: "#FBE3EA",
          200: "#F6C6D4",
          300: "#EFA1B8",
          400: "#E67D9C", // accent
          500: "#D85C81",
          600: "#BE4368",
          700: "#9C3553",
        },
        gold: {
          50: "#FBF6EA",
          100: "#F3E7C6",
          200: "#E7D199",
          300: "#D8B86A",
          400: "#C9A24A", // highlight
          500: "#AE8636",
        },
        ink: {
          DEFAULT: "#2C2A26",
          soft: "#6B6760",
          faint: "#9C978D",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(70, 82, 46, 0.18)",
        card: "0 10px 40px -16px rgba(44, 42, 38, 0.20)",
        glow: "0 0 0 1px rgba(201, 162, 74, 0.25), 0 12px 40px -12px rgba(201, 162, 74, 0.35)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.14)" },
          "100%": { transform: "scale(1)" },
        },
        "cart-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-5px)" },
          "60%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.8s ease-out both",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        pop: "pop 0.4s ease-out",
        "cart-bounce": "cart-bounce 0.5s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
