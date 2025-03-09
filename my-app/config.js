// config.js
const config = {
    apiUrl: process.env.NODE_ENV === "production"
      ? "https://pdf-rag-e3i0.onrender.com"  // Cloud URL
      : "http://localhost:5000",             // Lokale URL
  };
  
  export default config;
  