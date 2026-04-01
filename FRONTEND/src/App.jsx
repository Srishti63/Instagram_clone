import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import VerifyOTP from "./Pages/VerifyOTP";
import Home from "./Pages/Home";
import CreatePost from "./Pages/CreatePost";
import Messages from "./Pages/Messages";
import Profile from "./Pages/Profile";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Layout from "./Components/Layout/Layout";

// A simple protected route wrapper that now wraps everything inside Layout
const ProtectedRoute = ({ children }) => {
  return <Layout>{children}</Layout>;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
      <Route path="/reset-password" element={user ? <Navigate to="/" /> : <ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      
      {/* Protected Routes wrapped in our Sidebar Layout */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile/:id" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      {/* We can add more protected routes like profile, search, etc. here later */}
    </Routes>
  );
}

export default App;
