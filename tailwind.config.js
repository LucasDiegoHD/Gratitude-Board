/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "tb-green-dark": "#014627",
        "tb-navy": "#0C1C68",
        "tb-yellow": "#F1BB01",
        "tb-green": "#54A158",
        "tb-green-light": "#58D85E",
        "tb-yellow-light": "#FFE372",
        "tb-blue": "#477AAB",
        "tb-black": "#101010",
      },
      fontFamily: {
        barlow: ["Barlow", "sans-serif"],
        "barlow-condensed": ["Barlow Condensed", "sans-serif"],
      },
      keyframes: {
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.7) rotate(-2deg)" },
          "70%": { opacity: "1", transform: "scale(1.05) rotate(1deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
      animation: {
        "pop-in": "popIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "live-pulse": "pulse 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
