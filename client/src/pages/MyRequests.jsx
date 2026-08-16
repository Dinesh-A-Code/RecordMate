import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyRequestsRequest } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import { useSocketEvent } from "../context/SocketContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyRequestsRequest()
      .then(setRequests)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  // A status change only ever fires this event for one of the requester's
  // own requests (see server/socket.js) — simplest correct reaction is a
  // lightweight refetch rather than patching one item into local state.
  useSocketEvent("request:updated", () => {
    getMyRequestsRequest()
      .then(setRequests)
      .catch(() => {});
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">My Requests</h2>
          <Link
            to="/requests/create"
            className="text-sm bg-blue-600 text-white rounded px-3 py-1.5 hover:bg-blue-700"
          >
            + New Request
          </Link>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 text-sm">
            You haven't created any requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Link
                key={request._id}
                to={`/requests/${request._id}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-gray-800">{request.recordType}</p>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-sm text-gray-500">{request.subject}</p>
                {request.providerId && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Provider: {request.providerId.name}
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>{request.pages} pages</span>
                  <span>₹{request.payment}</span>
                  <span>Due {new Date(request.deadline).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
