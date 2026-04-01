import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../Api/axios";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
       setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Verify OTP
      await API.post("/users/verify-forgot-otp", { email, otp });
      // 2. Reset Password
      await API.post("/users/reset-password", { email, newPassword });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Ensure OTP is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent italic">
                InstaClone
            </h1>
          <h2 className="text-xl font-semibold mt-4 text-gray-800">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-500">Enter the OTP sent to your email and your new password.</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-500 bg-green-50 rounded-lg text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50 text-center tracking-widest font-mono"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="New Password"
              className="w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !otp.trim() || !newPassword.trim()}
            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-black">
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
