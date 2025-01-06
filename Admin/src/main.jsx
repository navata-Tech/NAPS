import { BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Basic logger to verify React rendering
console.log('Starting React app...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found. React app cannot render.');
  } else {
    createRoot(rootElement).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    console.log('React app rendered successfully.');
  }
} catch (error) {
  console.error('Error rendering React app:', error);
}
