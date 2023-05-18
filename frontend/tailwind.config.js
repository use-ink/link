module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          50: "#F9F9FB",
          100: "#F3F3F6",
          200: "#E5E5EB",
          300: "#D1D1DB",
          400: "#9D9CAF",
          500: "#6C6B80",
          600: "#4C4B63",
          700: "#383751",
          800: "#201F37",
          900: "#121127",
        },
        purple: {
          300: "#D7B5FD",
          800: "#3D2B52",
          850: "#2A2442",
          900: "#201F37",
          transparent: "rgba(191, 139, 250, 0.4)",
          transparent2: "rgba(191, 139, 250, 0.3)",
        },
        success: {
          500: '#00c900'
        },
        warning: {
          500: '#ffbe54'
        },
        error: {
          500: '#d6502b'
        },
        info: {
          500: '#bc83fb'
        }
      },
    },
  },
  plugins: [],
};
