export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))", muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))", border: "hsl(var(--border))",
        input: "hsl(var(--input))", ring: "hsl(var(--ring))", fuchsia: "#C026D3",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"], body: ["var(--font-body)", "serif"], mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        twinkle: { '0%, 100%': { opacity: 0.25 }, '50%': { opacity: 1 } },
        floatSlow: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        spinSlow: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
      },
      animation: {
        'twinkle': 'twinkle 4s ease-in-out infinite', 'float-slow': 'floatSlow 18s ease-in-out infinite',
        'spin-slow': 'spinSlow 120s linear infinite', 'fade-up': 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
      }
    },
  },
  plugins: [],
}
