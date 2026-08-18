import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyRequestsRequest } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import { useSocketEvent } from "../context/SocketContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";

export default function MyRequests() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto py-10 md:py-14">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-3">
                RecordMate / My Requests
              </p>
              <h1 className="font-headline-md text-headline-md text-on-surface">My Requests</h1>
            </div>
            <Button variant="primary" onClick={() => navigate("/requests/create")}>
              + New Request
            </Button>
          </div>

          {error && (
            <div className="mb-6 font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <p className="font-metadata text-metadata text-on-surface-variant">Loading...</p>
          ) : requests.length === 0 ? (
            <div className="border border-outline-variant/30 bg-surface-container-low px-6 py-16 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                You haven't created any requests yet.
              </p>
              <Button variant="primary" onClick={() => navigate("/requests/create")}>
                Create your first request
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
              {requests.map((request) => (
                <Link
                  key={request._id}
                  to={`/requests/${request._id}`}
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
                  {request.providerId && (
                    <p className="font-metadata text-metadata text-on-surface-variant/80 mt-0.5">
                      Provider: {request.providerId.name}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-between gap-x-4 font-metadata text-metadata text-on-surface-variant mt-3">
                    <span>{request.pages} pages</span>
                    <span>₹{request.payment}</span>
                    <span>Due {new Date(request.deadline).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
