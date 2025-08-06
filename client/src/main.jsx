
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import { SocketProvider } from './context/socketprovider.jsx'
import './index.css'
import App from './App.jsx'

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
      <BrowserRouter>
      <SocketProvider>
        <App />
      </SocketProvider>
      </BrowserRouter>
  );
}
