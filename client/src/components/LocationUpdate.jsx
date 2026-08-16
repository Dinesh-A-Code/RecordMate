import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyProfileRequest } from "../services/userService";
import { getErrorMessage } from "../services/api";

export default function LocationUpdate() {
  const { user, updateUser } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hasLocation = Boolean(user?.location);

  const handleUpdateLocation = () => {
    setError("");
    setSuccess("");

    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location services.");
      return;
    }

    setRequesting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const updatedUser = await updateMyProfileRequest({ latitude, longitude });
          updateUser(updatedUser);
          setSuccess("Location updated.");
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setRequesting(false);
        }
      },
      (geoError) => {
        setRequesting(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Location permission denied. Enable it in your browser settings to use nearby matching.");
        } else {
          setError("Couldn't get your location. Please try again.");
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Location</p>
      <p className="text-sm text-gray-600 mb-3">
        {hasLocation
          ? "Location saved. Only used to find nearby requests — never shown to other users as exact coordinates."
          : "No location set yet. Add one so nearby matching can work in a later phase."}
      </p>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {success}
        </div>
      )}

      <button
        onClick={handleUpdateLocation}
        disabled={requesting}
        className="w-full bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
      >
        {requesting ? "Getting location..." : "Update My Location"}
      </button>
    </div>
  );
}
