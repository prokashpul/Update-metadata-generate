import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safeguard window.fetch from being overwritten by polyfills that might fail
try {
  if (typeof window !== 'undefined' && window.fetch) {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    // If it's already a getter-only or not writable, it's already safe.
    if (descriptor && (descriptor.get || descriptor.writable === false)) {
      // Already read-only or a getter, good.
    } else {
      try {
        const originalFetch = window.fetch;
        Object.defineProperty(window, 'fetch', {
          value: originalFetch,
          writable: false,
          configurable: true
        });
      } catch (innerError) {
        console.warn('Could not redefine window.fetch:', innerError);
      }
    }
  }
} catch (e) {
  console.warn('Safeguard for window.fetch failed:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
