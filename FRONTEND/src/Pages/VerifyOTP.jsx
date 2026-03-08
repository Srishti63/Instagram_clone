import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useLocation, useNavigate, Navigate } from "react-router-dom";

export default function VerifyOTP() {
  const { verifyOtp, resendOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const email = location.state?.email;

  // Handle countdown timer for Resend button
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // If user accesses this page without an email passed in state, send them to register
  if (!email) {
    return <Navigate to="/register" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      // Registration complete, head to login to actually sign in
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    try {
      await resendOtp(email);
      setMessage("A new OTP has been sent to your email.");
      setResendCooldown(60); // Reset timer
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Verify Email</h1>
          <p className="mt-2 text-sm text-gray-500">
            We sent a code to <span className="font-semibold">{email}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
            {error}
          </div>
        )}
        
        {message && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full px-4 py-3 text-center tracking-widest text-lg border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-3 text-white font-semibold bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className={`text-sm font-semibold transition-colors ${
              resendCooldown > 0 
                ? "text-gray-400 cursor-not-allowed" 
                : "text-pink-500 hover:text-pink-600"
            }`}
          >
            {resendCooldown > 0 
              ? `Resend OTP in ${resendCooldown}s` 
              : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}
