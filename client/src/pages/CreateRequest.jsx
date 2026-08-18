import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createRequestRequest } from "../services/requestService";
import { updateMyProfileRequest } from "../services/userService";
import { getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

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
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl mx-auto py-16 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Switch to REQUESTER mode ("Need a Writer") to create a record request.
            </p>
            <Link
              to="/dashboard"
              className="font-metadata text-metadata text-primary hover:underline mt-3 inline-block"
            >
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
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto py-10 md:py-14">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-3">
            RecordMate / New Request
          </p>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
            Create a Record Request
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            Describe the record you need written and set a radius so nearby students can find it.
          </p>

          {error && (
            <div className="mb-6 font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="field-label block">Record Type</label>
              <input
                type="text"
                name="recordType"
                value={form.recordType}
                onChange={handleChange}
                placeholder="Practical Record"
                required
                className="field-input"
              />
            </div>

            <div className="space-y-2">
              <label className="field-label block">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Agronomy"
                required
                className="field-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="field-label block">Pages</label>
                <input
                  type="number"
                  name="pages"
                  value={form.pages}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                  className="field-input"
                />
              </div>
              <div className="space-y-2">
                <label className="field-label block">Payment (₹)</label>
                <input
                  type="number"
                  name="payment"
                  value={form.payment}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  className="field-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="field-label block">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                required
                className="field-input"
              />
            </div>

            <div className="space-y-2">
              <label className="field-label block">
                Description <span className="text-on-surface-variant/70 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                placeholder="Need handwritten record completion."
                className="field-textarea"
              />
            </div>

            <div className="space-y-2">
              <label className="field-label block">Search Radius (km)</label>
              <input
                type="number"
                name="radius"
                value={form.radius}
                onChange={handleChange}
                min="1"
                max="50"
                step="1"
                required
                className="field-input"
              />
            </div>

            <div className="border border-outline-variant/30 px-4 py-4">
              <p className="field-label block mb-1">Location</p>
              <p className="font-metadata text-metadata text-on-surface-variant mb-3">
                {user?.location
                  ? "Using your saved profile location."
                  : "No location set. Add one so providers nearby can find this request."}
              </p>
              <Button
                type="button"
                variant="secondary"
                onClick={handleUseCurrentLocation}
                disabled={locatingNow}
              >
                {locatingNow ? "Getting location..." : "Use My Current Location"}
              </Button>
            </div>

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">
              {submitting ? "Creating..." : "Create Request"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
