import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/globals.css';

// Only configure Amplify if we have the env vars (not in demo mode)
if (import.meta.env.VITE_COGNITO_USER_POOL_ID) {
  import('./lib/amplify-config').then(({ amplifyConfig }) => {
    import('aws-amplify').then(({ Amplify }) => {
      Amplify.configure(amplifyConfig as any);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
