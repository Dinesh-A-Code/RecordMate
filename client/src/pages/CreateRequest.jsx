import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createRequestRequest } from "../services/requestService";
import { updateMyProfileRequest } from "../services/userService";
import { getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";

const initialForm = {
  recordType: "",
  subject: "",
  pages: "",
  deadline: "",
  payment: "",
  description: "",
  radius: "2",
};

export default function CreateRequest() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [locatingNow, setLocatingNow] = useState(false);

  // Not a security boundary (the backend enforces this too) — just avoids
  // showing a form the user isn't allowed to submit.
  if (user?.mode !== "REQUESTER") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-700">
              Switch to REQUESTER mode ("Need a Writer") to create a record request.
            </p>
            <Link to="/dashboard" className="text-blue-600 hover:underline text-sm mt-3 inline-block">
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUseCurrentLocation = () => {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location services.");
      return;
    }
    setLocatingNow(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const updatedUser = await updateMyProfileRequest({ latitude, longitude });
          updateUser(updatedUser);
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setLocatingNow(false);
        }
      },
      () => {
        setLocatingNow(false);
        setError("Couldn't get your location. Please allow location access and try again.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user?.location) {
      setError("Set your location first using \"Use My Current Location\" below.");
      return;
    }

    const pages = Number(form.pages);
    const payment = Number(form.payment);
    const radius = Number(form.radius);

    if (!form.recordType.trim() || !form.subject.trim()) {
      setError("Record type and subject are required.");
      return;
    }
    if (!Number.isInteger(pages) || pages <= 0) {
      setError("Pages must be a positive whole number.");
      return;
    }
    if (!form.deadline) {
      setError("Deadline is required.");
      return;
    }
    if (Number.isNaN(payment) || payment < 0) {
      setError("Payment must be a non-negative number.");
      return;
    }
    if (Number.isNaN(radius) || radius <= 0 || radius > 50) {
      setError("Radius must be between 1 and 50 km.");
      return;
    }

    setSubmitting(true);
    try {
      const request = await createRequestRequest({
        recordType: form.recordType.trim(),
        subject: form.subject.trim(),
        pages,
        deadline: form.deadline,
        payment,
        description: form.description.trim(),
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        radius,
      });
      navigate(`/requests/${request._id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a Record Request</h2>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
              <input
                type="text"
                name="recordType"
                value={form.recordType}
                onChange={handleChange}
                placeholder="Practical Record"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Agronomy"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                <input
                  type="number"
                  name="pages"
                  value={form.pages}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment (₹)</label>
                <input
                  type="number"
                  name="payment"
                  value={form.payment}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                placeholder="Need handwritten record completion."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius (km)</label>
              <input
                type="number"
                name="radius"
                value={form.radius}
                onChange={handleChange}
                min="1"
                max="50"
                step="1"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border border-gray-200 rounded px-3 py-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
              <p className="text-sm text-gray-500 mb-2">
                {user?.location
                  ? "Using your saved profile location."
                  : "No location set. Add one so providers nearby can find this request."}
              </p>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locatingNow}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-1.5 disabled:opacity-60"
              >
                {locatingNow ? "Getting location..." : "Use My Current Location"}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Request"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
