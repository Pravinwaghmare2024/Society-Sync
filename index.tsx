import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const mount = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.error("Mount point #root not found.");
  }
};

// Start application
mount();