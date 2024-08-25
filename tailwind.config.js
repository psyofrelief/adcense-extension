/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./popup.html", // Include your popup HTML file
    "./**/*.js", // Include all JavaScript files in the project
    "./background.js", // Include your background script
  ],
  theme: {
    extend: {
      colors: {
        primary: "#582759",
        black: "#001102",
        white: "#FAFAFAee",
        grey: "#A1A1AA",
        darkGrey: "#27272A",
        greenDarker: "#1A5319",
        greenDark: "#508D4E",
        greenMedium: "#80AF81",
        greenLight: "#D6EFD8",
      },
      fontFamily: {
        assistant: "Assistant",
      },
    },
  },
  plugins: [],
};
