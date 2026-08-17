/** Tailwind CSS v4 is CSS-first — theme tokens live in src/app/globals.css (@theme block),
 * not in a tailwind.config.js. This file just wires the PostCSS plugin. */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
