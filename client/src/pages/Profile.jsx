import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyProfileRequest } from "../services/userService";
import { getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import ModeSwitch from "../components/ModeSwitch";
import LocationUpdate from "../components/LocationUpdate";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    college: user?.college || "",
    department: user?.department || "",
    profilePicture: user?.profilePicture || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.college.trim() || !form.department.trim()) {
      setError("Name, college, and department cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateMyProfileRequest({
        name: form.name,
        college: form.college,
        department: form.department,
        profilePicture: form.profilePicture || null,
      });
      updateUser(updatedUser);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-xl mx-auto p-6 space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-4 mb-6">
            {form.profilePicture ? (
              <img
                src={form.profilePicture}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover bg-gray-200"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Rating: {user?.rating ?? 0} ★
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full border border-gray-200 bg-gray-100 text-gray-500 rounded px-3 py-2 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed in this MVP.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
              <input
                type="text"
                name="college"
                value={form.college}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="profilePicture"
                value={form.profilePicture}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <ModeSwitch />
        <LocationUpdate />
      </main>
    </div>
  );
}
