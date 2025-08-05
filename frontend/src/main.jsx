import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TagProvider } from './context/TagContext';
import 'setimmediate';
import process from 'process';
import { AuthProvider } from './context/AuthContext.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { NotificationProvider } from './context/NotificationContext';
import { BrowserRouter } from 'react-router-dom';

window.global = window;
window.process = process;

if (typeof window.setImmediate === 'undefined') {
  window.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <TagProvider>
        <NotificationProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </NotificationProvider>
      </TagProvider>
    </AuthProvider>
  </BrowserRouter>
);
