import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNearbyRequestsRequest } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";
import { useSocketEvent } from "../context/SocketContext";

export default function NearbyRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [collegeMode, setCollegeMode] = useState("same");
  const [sort, setSort] = useState("distance");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasLocation = Boolean(user?.location);

  useEffect(() => {
    if (!hasLocation) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    getNearbyRequestsRequest({ collegeMode, sort })
      .then(setRequests)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeMode, sort, hasLocation]);

  // A newly-created request might match this provider's filters — the
  // eligibility check (radius, OPEN status, college) is fully re-applied
  // server-side by this refetch, never assumed from the event itself.
  useSocketEvent("request:new", () => {
    if (!hasLocation) return;
    getNearbyRequestsRequest({ collegeMode, sort })
      .then(setRequests)
      .catch(() => {});
  });

  // Another provider accepted it (or the requester cancelled it) — drop it
  // from the current list without a round trip, since all we need is the id.
  useSocketEvent("request:unavailable", (payload) => {
    setRequests((prev) => prev.filter((r) => r.id !== payload?.requestId));
  });

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto py-10 md:py-14">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-3">
            RecordMate / Nearby
          </p>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">
            Nearby opportunities
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8">
            Find record requests from students around you.
          </p>

          {!hasLocation ? (
            <div className="border border-outline-variant/30 bg-surface-container-low px-6 py-12 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                Please update your location before searching for nearby requests.
              </p>
              <Button variant="primary" onClick={() => navigate("/profile")}>
                Go to Profile
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex-1 min-w-[160px] space-y-2">
                  <label className="field-label block">College</label>
                  <select
                    value={collegeMode}
                    onChange={(e) => setCollegeMode(e.target.value)}
                    className="field-select"
                  >
                    <option value="same">Same College</option>
                    <option value="all">All Nearby</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[160px] space-y-2">
                  <label className="field-label block">Sort</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="field-select"
                  >
                    <option value="distance">Nearest</option>
                    <option value="payment">Highest Payment</option>
                    <option value="deadline">Earliest Deadline</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <p className="font-metadata text-metadata text-on-surface-variant">
                  Finding nearby requests...
                </p>
              ) : error ? (
                <div className="font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-4 py-3">
                  Unable to load nearby requests. {error}
                </div>
              ) : requests.length === 0 ? (
                <div className="border border-outline-variant/30 bg-surface-container-low px-6 py-16 text-center">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    No nearby requests found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
                  {requests.map((request) => (
                    <Link
                      key={request.id}
                      to={`/requests/${request.id}`}
                      className="block py-5 px-2 -mx-2 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <p className="font-body-md text-body-md font-semibold text-on-surface">
                          {request.recordType}
                        </p>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="font-metadata text-metadata text-on-surface-variant">
                        {request.subject}
                      </p>
                      {request.description && (
                        <p className="font-metadata text-metadata text-on-surface-variant/80 mt-1 line-clamp-2">
                          {request.description}
                        </p>
                      )}
                      <div className="flex flex-wrap justify-between gap-x-4 font-metadata text-metadata text-on-surface-variant mt-3">
                        <span>{request.pages} pages</span>
                        <span>₹{request.payment}</span>
                        <span>Due {new Date(request.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between font-metadata text-metadata text-on-surface-variant mt-1">
                        <span>{request.college || "Unknown college"}</span>
                        <span>{request.distanceKm} km away</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
