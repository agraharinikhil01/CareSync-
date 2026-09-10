import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#2c3338',
              color: '#ffffff',
              fontSize: '13px',
              borderRadius: '3px',
              padding: '10px 14px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            },
            success: {
              iconTheme: {
                primary: '#00a32a',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#d63638',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
