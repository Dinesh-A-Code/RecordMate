import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyModeRequest } from "../services/userService";
import { getErrorMessage } from "../services/api";

const MODE_LABELS = {
  REQUESTER: { current: "Need a Writer", switchTo: "Want to Write" },
  PROVIDER: { current: "Want to Write", switchTo: "Need a Writer" },
};

export default function ModeSwitch() {
  const { user, updateUser } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");

  const mode = user?.mode || "REQUESTER";
  const labels = MODE_LABELS[mode];
  const nextMode = mode === "REQUESTER" ? "PROVIDER" : "REQUESTER";

  const handleSwitch = async () => {
    setError("");
    setSwitching(true);
    try {
      const updatedUser = await updateMyModeRequest(nextMode);
      updateUser(updatedUser);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Current Mode</p>
      <p className="text-lg font-semibold text-gray-800 mb-3">{labels.current}</p>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <button
        onClick={handleSwitch}
        disabled={switching}
        className="w-full bg-gray-800 text-white rounded py-2 text-sm font-medium hover:bg-gray-900 disabled:opacity-60"
      >
        {switching ? "Switching..." : `Switch to ${labels.switchTo}`}
      </button>
    </div>
  );
}
