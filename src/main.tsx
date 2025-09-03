import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/supabasePerformance'; // Initialize Supabase performance monitoring

createRoot(document.getElementById("root")!).render(
  <App />
);
