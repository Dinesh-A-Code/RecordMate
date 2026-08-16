import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyModeRequest } from "../services/userService";
import { getErrorMessage } from "../services/api";

const SEGMENTS = [
  { mode: "REQUESTER", label: "Need a Writer" },
  { mode: "PROVIDER", label: "Want to Write" },
];

export default function ModeSwitch() {
  const { user, updateUser } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");

  const mode = user?.mode || "REQUESTER";

  const handleSelect = async (targetMode) => {
    if (targetMode === mode || switching) return;
    setError("");
    setSwitching(true);
    try {
      const updatedUser = await updateMyModeRequest(targetMode);
      updateUser(updatedUser);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSwitching(false);
    }
  };

  return (
    // Kept as a light contained block (rather than Stitch's borderless,
    // just-a-segmented-control-on-parchment look) so it doesn't look
    // orphaned sitting among the still-unredesigned bg-white/shadow cards
    // on Dashboard/Profile until those pages catch up in a later part.
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-DEFAULT p-4">
      <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">Current Mode</p>

      <div className="inline-flex bg-surface rounded-DEFAULT p-1 border border-outline-variant/30">
        {SEGMENTS.map((segment) => {
          const isActive = segment.mode === mode;
          return (
            <button
              key={segment.mode}
              type="button"
              onClick={() => handleSelect(segment.mode)}
              disabled={switching}
              className={`px-4 sm:px-6 py-2 font-metadata text-metadata border-b transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                isActive
                  ? "text-primary border-primary"
                  : "text-on-surface-variant border-transparent hover:text-on-surface"
              }`}
            >
              {segment.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-3 font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
