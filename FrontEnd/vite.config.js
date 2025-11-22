const { defineConfig } = require("vite");

// https://vitejs.dev/config/
module.exports = defineConfig(async () => {
  // Dynamically import the ESM-only plugin
  const { default: react } = await import(
    "@vitejs/plugin-react"
  );

  return {
    plugins: [react()],
    server: {
      proxy: {
        // If a request starts with /api, forward it to the backend
        "/api": {
          target: "http://localhost:3000", // <-- CHANGE THIS to your backend port (e.g. 8080)
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
