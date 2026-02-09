import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * SocietySync Entry Point
 * This file initializes the React root and renders the main App component.
 * When hosted on IIS, the web.config ensures this .tsx file is served 
 * with the correct MIME type for Babel Standalone to process.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Ensure index.html has a <div id='root'></div>");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);