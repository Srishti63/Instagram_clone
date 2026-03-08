import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import { SocketProvider } from './Context/SocketContext.jsx'

const RootApp = () => {
  const userId = localStorage.getItem("userId");

  return (
    <BrowserRouter>
      {/* SocketProvider gets placed inside so it can potentially access auth data down the line */}
      <SocketProvider userId={userId}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SocketProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
)
