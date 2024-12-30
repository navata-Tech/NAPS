import { BrowserRouter } from 'react-router-dom'; // Corrected import
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // Ensure correct import path and default export
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
