import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyProfileRequest } from "../services/userService";
import { getErrorMessage } from "../services/api";
import Button from "./Button";

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
    // Same light contained treatment as the sibling ModeSwitch component —
    // the two sit side by side on Profile, so they're kept as a matched pair.
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-DEFAULT p-4">
      <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">Location</p>
      <p className="font-metadata text-metadata text-on-surface-variant mb-4">
        {hasLocation
          ? "Location saved. Only used to find nearby requests — never shown to other users as exact coordinates."
          : "No location set yet. Add one so nearby matching works correctly."}
      </p>

      {error && (
        <div className="mb-4 font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 font-metadata text-metadata text-primary bg-primary/10 border border-primary/20 rounded-DEFAULT px-3 py-2">
          {success}
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleUpdateLocation}
        disabled={requesting}
        className="w-full"
      >
        {requesting ? "Getting location..." : "Update My Location"}
      </Button>
    </div>
  );
}
