import Sidebar from "../Navigation/Sidebar";
import { useAuth } from "../../Context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Layout({ children }) {
  const { user, loading } = useAuth();

  // Show a loading state until context resolves the user
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
    </div>
  );

  // If no user is found after loading, kick out to login
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area - Added left margin equal to sidebar width */}
      <main className="flex-1 ml-16 md:ml-64 relative bg-gray-50 min-h-screen">
        <div className="max-w-[1000px] mx-auto min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
