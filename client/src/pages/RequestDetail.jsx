import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getRequestByIdRequest,
  cancelRequestRequest,
  acceptRequestRequest,
  updateRequestStatusRequest,
} from "../services/requestService";
import { getErrorMessage } from "../services/api";
import { useSocketEvent } from "../context/SocketContext";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function RequestDetail() {
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [confirmingAccept, setConfirmingAccept] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    getRequestByIdRequest(id)
      .then(setRequest)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  // Only refetch when the event is about *this* request — request:updated
  // fires for any of the requester's requests, and this page only cares
  // about the one it's currently showing.
  useSocketEvent("request:updated", (payload) => {
    if (payload?.requestId === id) {
      getRequestByIdRequest(id)
        .then(setRequest)
        .catch(() => {});
    }
  });

  // The owner response includes requesterId (a populated object, always
  // truthy); the provider-facing response never includes that key at all —
  // it has `college`/`distanceKm` instead. This tells the two apart without
  // a separate flag from the backend.
  const isOwnerView = Boolean(request?.requesterId);

  // For a non-owner viewer, the backend only ever returns a request that's
  // either still OPEN (an eligible-but-not-yet-accepted provider browsing
  // it) or one this exact user is assigned to (anyone else gets a 403
  // before this page ever renders it) — so status alone tells us which.
  const isAssignedProviderView = !isOwnerView && request && request.status !== "OPEN";

  const backLink = isOwnerView
    ? "/requests/my"
    : request?.status === "OPEN"
    ? "/requests/nearby"
    : "/requests/accepted";

  const handleCancel = async () => {
    if (!window.confirm("Cancel this request? This cannot be undone.")) return;
    setCancelling(true);
    setError("");
    try {
      const updated = await cancelRequestRequest(id);
      setRequest(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    setError("");
    try {
      await acceptRequestRequest(id);
      // Re-fetch through the normal detail endpoint so we get back the
      // correctly-shaped "assigned provider" view rather than assuming a
      // shape here.
      const refreshed = await getRequestByIdRequest(id);
      setRequest(refreshed);
    } catch (err) {
      // Covers the "someone else already accepted it" / cancelled-in-the-
      // meantime race — the backend's message already says exactly that.
      setError(getErrorMessage(err));
    } finally {
      setAccepting(false);
      setConfirmingAccept(false);
    }
  };

  const handleStatusUpdate = async (targetStatus) => {
    setUpdatingStatus(true);
    setError("");
    try {
      await updateRequestStatusRequest(id, targetStatus);
      const refreshed = await getRequestByIdRequest(id);
      setRequest(refreshed);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto p-6">
        <Link to={backLink} className="text-sm text-blue-600 hover:underline">
          ← Back
        </Link>

        {error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm mt-4">Loading...</p>
        ) : !request ? null : (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{request.recordType}</h2>
                <p className="text-gray-500">{request.subject}</p>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <dl className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Pages</dt>
                <dd>{request.pages}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Payment</dt>
                <dd>₹{request.payment}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Deadline</dt>
                <dd>{new Date(request.deadline).toLocaleDateString()}</dd>
              </div>

              {isOwnerView ? (
                <>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Search Radius</dt>
                    <dd>{request.radius} km</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">Created</dt>
                    <dd>{new Date(request.createdAt).toLocaleDateString()}</dd>
                  </div>
                  {request.providerId && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Provider</dt>
                      <dd>
                        {request.providerId.name} · {request.providerId.college}
                      </dd>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-500">College</dt>
                    <dd>{request.college || "Unknown"}</dd>
                  </div>
                  {typeof request.distanceKm === "number" && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-500">Distance</dt>
                      <dd>{request.distanceKm} km away</dd>
                    </div>
                  )}
                </>
              )}

              {request.description && (
                <div>
                  <dt className="font-medium text-gray-500 mb-1">Description</dt>
                  <dd className="text-gray-700">{request.description}</dd>
                </div>
              )}
            </dl>

            {/* Owner: cancel an OPEN request */}
            {isOwnerView && request.status === "OPEN" && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full mt-6 bg-red-50 text-red-700 border border-red-200 rounded py-2 text-sm font-medium hover:bg-red-100 disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Cancel Request"}
              </button>
            )}

            {/* Eligible provider: accept an OPEN request, with confirmation */}
            {!isOwnerView && !isAssignedProviderView && request.status === "OPEN" && (
              confirmingAccept ? (
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-gray-700 text-center">
                    Accept this record-writing request?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmingAccept(false)}
                      disabled={accepting}
                      className="flex-1 bg-gray-100 text-gray-700 rounded py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAccept}
                      disabled={accepting}
                      className="flex-1 bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                    >
                      {accepting ? "Accepting..." : "Accept"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingAccept(true)}
                  className="w-full mt-6 bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700"
                >
                  Accept Request
                </button>
              )
            )}

            {/* Assigned provider: move the task forward */}
            {isAssignedProviderView && request.status === "ACCEPTED" && (
              <button
                onClick={() => handleStatusUpdate("IN_PROGRESS")}
                disabled={updatingStatus}
                className="w-full mt-6 bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {updatingStatus ? "Updating..." : "Start Task"}
              </button>
            )}
            {isAssignedProviderView && request.status === "IN_PROGRESS" && (
              <button
                onClick={() => handleStatusUpdate("COMPLETED")}
                disabled={updatingStatus}
                className="w-full mt-6 bg-blue-600 text-white rounded py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {updatingStatus ? "Updating..." : "Mark Completed"}
              </button>
            )}
            {isAssignedProviderView && request.status === "COMPLETED" && (
              <p className="w-full mt-6 text-center text-sm text-gray-500">Task Completed</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
