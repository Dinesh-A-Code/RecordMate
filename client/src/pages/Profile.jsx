import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyProfileRequest } from "../services/userService";
import { getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import ModeSwitch from "../components/ModeSwitch";
import LocationUpdate from "../components/LocationUpdate";
import Button from "../components/Button";

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
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="border border-outline-variant/30 bg-surface-container-low p-6 md:p-8">
            <div className="flex items-center gap-4">
              {form.profilePicture ? (
                <img
                  src={form.profilePicture}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover bg-surface-container-high shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-xl font-semibold shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-body-lg text-body-lg font-bold text-on-surface truncate">
                  {user?.name}
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant truncate">
                  {user?.email}
                </p>
                <p className="font-metadata text-metadata text-on-surface-variant mt-0.5">
                  Rating: {user?.rating ?? 0} ★
                </p>
              </div>
            </div>

            <div className="border-t border-outline-variant/30 mt-6 pt-6">
              {error && (
                <div className="mb-6 font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-4 py-3">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 font-metadata text-metadata text-primary bg-primary/10 border border-primary/20 rounded-DEFAULT px-4 py-3">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="field-label block">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="field-input disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <p className="field-help">Email cannot be changed in this MVP.</p>
                </div>

                <div className="space-y-2">
                  <label className="field-label block">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="field-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="field-label block">College</label>
                    <input
                      type="text"
                      name="college"
                      value={form.college}
                      onChange={handleChange}
                      required
                      className="field-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="field-label block">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      required
                      className="field-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="field-label block">
                    Profile Picture URL <span className="text-on-surface-variant/70 normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="profilePicture"
                    value={form.profilePicture}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="field-input"
                  />
                </div>

                <Button type="submit" variant="primary" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </div>
          </div>

          <ModeSwitch />
          <LocationUpdate />
        </div>
      </main>
    </div>
  );
}
