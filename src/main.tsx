import React from 'react';
import ReactDOM from 'react-dom/client';

// Polices variables auto-hébergées retenues après comparaison visuelle (Syne + Space Grotesk + Fraunces + JetBrains Mono)
import '@fontsource-variable/syne';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/jetbrains-mono';

import { App } from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
