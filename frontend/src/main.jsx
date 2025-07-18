import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TagProvider } from './context/TagContext';

// ✅ Fix for Draft.js - setImmediate polyfill
import 'setimmediate';
import process from 'process';

window.global = window;
window.process = process;

if (typeof window.setImmediate === 'undefined') {
  window.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

createRoot(document.getElementById('root')).render(
    <TagProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </TagProvider>
);
