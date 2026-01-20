/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require("nativewind/preset")],
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                gold: '#D4AF37', // Common custom color from web
            },
            fontFamily: {
                display: ['System'], // Fallback for now, will port fonts later
                sans: ['System'],
            }
        },
    },
    plugins: [],
}
