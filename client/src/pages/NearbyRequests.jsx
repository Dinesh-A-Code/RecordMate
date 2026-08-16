import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNearbyRequestsRequest } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import { useSocketEvent } from "../context/SocketContext";

export default function NearbyRequests() {
  const { user } = useAuth();

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Nearby Requests</h2>

        {!hasLocation ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-700 mb-3">
              Please update your location before searching for nearby requests.
            </p>
            <Link to="/profile" className="text-blue-600 hover:underline text-sm">
              Go to Profile
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <select
                value={collegeMode}
                onChange={(e) => setCollegeMode(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
              >
                <option value="same">Same College</option>
                <option value="all">All Nearby</option>
              </select>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
              >
                <option value="distance">Sort: Nearest</option>
                <option value="payment">Sort: Highest Payment</option>
                <option value="deadline">Sort: Earliest Deadline</option>
              </select>
            </div>

            {loading ? (
              <p className="text-gray-500 text-sm">Finding nearby requests...</p>
            ) : error ? (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                Unable to load nearby requests. {error}
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 text-sm">
                No nearby requests found.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Link
                    key={request.id}
                    to={`/requests/${request.id}`}
                    className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-800">{request.recordType}</p>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-gray-500">{request.subject}</p>
                    {request.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{request.description}</p>
                    )}
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>{request.pages} pages</span>
                      <span>₹{request.payment}</span>
                      <span>Due {new Date(request.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>{request.college || "Unknown college"}</span>
                      <span>{request.distanceKm} km away</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
