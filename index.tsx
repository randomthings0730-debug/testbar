
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 動態載入 Google Fonts (符合 CSP 規範)
function loadGoogleFonts() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap";

  link.onload = () => console.log("Google Fonts CSS loaded successfully");
  link.onerror = () => console.error("Failed to load Google Fonts CSS");

  (document.head || document.documentElement).appendChild(link);
}

// 載入字體
loadGoogleFonts();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
