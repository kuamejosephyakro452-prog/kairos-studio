import React from 'react';
import ReactDOM from 'react-dom/client';

// Polices variables auto-hébergées (sous-ensemble latin uniquement : 4 fichiers au lieu de 14)
import './styles/fonts.css';

import { App } from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
