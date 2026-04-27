import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { applyInitialTheme } from './theme';
import './styles.css';

applyInitialTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
