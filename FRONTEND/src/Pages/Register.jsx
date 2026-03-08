import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(formData);
      // Pass the email in state so the OTP page knows who to verify
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
            InstaClone
          </h1>
          <p className="mt-2 text-sm text-gray-500">Sign up to see photos from your friends.</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password (min 8 chars, 1 uppercase, 1 number)"
              className="w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-pink-500 focus:outline-none bg-gray-50"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Have an account?{" "}
          <Link to="/login" className="font-semibold text-pink-500 hover:text-pink-600">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
