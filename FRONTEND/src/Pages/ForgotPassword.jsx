import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../Api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/users/forgot-password", { email });
      setSuccess("OTP sent to your email! Redirecting...");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
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
          <h2 className="text-xl font-semibold mt-4 text-gray-800">Forgot Password?</h2>
          <p className="mt-2 text-sm text-gray-500">Enter your email and we'll send you an OTP to reset your password.</p>
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

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset OTP"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500 flex justify-center divide-x divide-gray-300">
          <Link to="/login" className="px-3 font-semibold text-gray-700 hover:text-black">
            Back to Log In
          </Link>
          <Link to="/register" className="px-3 font-semibold text-pink-500 hover:text-pink-600">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
