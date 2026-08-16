import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import Button from "../components/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-margin-mobile">
      <div className="w-full max-w-sm border border-outline-variant/30 bg-surface-container-low p-8">
        <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-4">
          RecordMate
        </p>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Welcome back</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          Log in to continue to your account.
        </p>

        {error && (
          <div className="mb-6 font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="field-label block">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="field-input"
            />
          </div>

          <div className="space-y-2">
            <label className="field-label block">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="field-input"
            />
          </div>

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <p className="mt-8 font-metadata text-metadata text-on-surface-variant text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
