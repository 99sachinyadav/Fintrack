/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        slate: "#0f1c2f",
        mist: "#dce6f7",
        brand: "#5be7c4",
        accent: "#ffb84d",
      },
      boxShadow: {
        panel: "0 24px 70px rgba(7, 17, 31, 0.18)",
      },
      backgroundImage: {
        aurora:
          "radial-gradient(circle at top left, rgba(91,231,196,0.18), transparent 28%), radial-gradient(circle at top right, rgba(91,143,255,0.18), transparent 24%), linear-gradient(135deg, #07111f 0%, #10223a 50%, #0b1527 100%)",
      },
    },
  },
  plugins: [],
};
