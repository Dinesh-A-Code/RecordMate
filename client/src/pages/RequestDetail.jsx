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
import Button from "../components/Button";

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
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto py-10 md:py-14">
          <Link to={backLink} className="font-metadata text-metadata text-primary hover:underline">
            ← Back
          </Link>

          {error && (
            <div className="mt-6 font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <p className="font-metadata text-metadata text-on-surface-variant mt-6">Loading...</p>
          ) : !request ? null : (
            <div className="mt-6">
              <div className="flex justify-between items-start gap-4 pb-6 border-b border-outline-variant/30">
                <div>
                  <h1 className="font-headline-md text-headline-md text-on-surface mb-1">
                    {request.recordType}
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">{request.subject}</p>
                </div>
                <StatusBadge status={request.status} />
              </div>

              <dl className="divide-y divide-outline-variant/20">
                <div className="flex justify-between py-3">
                  <dt className="font-metadata text-metadata text-on-surface-variant">Pages</dt>
                  <dd className="font-body-md text-body-md text-on-surface">{request.pages}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="font-metadata text-metadata text-on-surface-variant">Payment</dt>
                  <dd className="font-body-md text-body-md text-on-surface">₹{request.payment}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="font-metadata text-metadata text-on-surface-variant">Deadline</dt>
                  <dd className="font-body-md text-body-md text-on-surface">
                    {new Date(request.deadline).toLocaleDateString()}
                  </dd>
                </div>

                {isOwnerView ? (
                  <>
                    <div className="flex justify-between py-3">
                      <dt className="font-metadata text-metadata text-on-surface-variant">Search Radius</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{request.radius} km</dd>
                    </div>
                    <div className="flex justify-between py-3">
                      <dt className="font-metadata text-metadata text-on-surface-variant">Created</dt>
                      <dd className="font-body-md text-body-md text-on-surface">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    {request.providerId && (
                      <div className="flex justify-between py-3">
                        <dt className="font-metadata text-metadata text-on-surface-variant">Provider</dt>
                        <dd className="font-body-md text-body-md text-on-surface">
                          {request.providerId.name} · {request.providerId.college}
                        </dd>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-3">
                      <dt className="font-metadata text-metadata text-on-surface-variant">College</dt>
                      <dd className="font-body-md text-body-md text-on-surface">
                        {request.college || "Unknown"}
                      </dd>
                    </div>
                    {typeof request.distanceKm === "number" && (
                      <div className="flex justify-between py-3">
                        <dt className="font-metadata text-metadata text-on-surface-variant">Distance</dt>
                        <dd className="font-body-md text-body-md text-on-surface">
                          {request.distanceKm} km away
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {request.description && (
                  <div className="py-3">
                    <dt className="font-metadata text-metadata text-on-surface-variant mb-1">Description</dt>
                    <dd className="font-body-md text-body-md text-on-surface">{request.description}</dd>
                  </div>
                )}
              </dl>

              {/* Owner: cancel an OPEN request */}
              {isOwnerView && request.status === "OPEN" && (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full mt-8"
                >
                  {cancelling ? "Cancelling..." : "Cancel Request"}
                </Button>
              )}

              {/* Eligible provider: accept an OPEN request, with confirmation */}
              {!isOwnerView && !isAssignedProviderView && request.status === "OPEN" && (
                confirmingAccept ? (
                  <div className="mt-8 space-y-3">
                    <p className="font-body-md text-body-md text-on-surface text-center">
                      Accept this record-writing request?
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setConfirmingAccept(false)}
                        disabled={accepting}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleAccept}
                        disabled={accepting}
                        className="flex-1"
                      >
                        {accepting ? "Accepting..." : "Accept"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setConfirmingAccept(true)}
                    className="w-full mt-8"
                  >
                    Accept Request
                  </Button>
                )
              )}

              {/* Assigned provider: move the task forward */}
              {isAssignedProviderView && request.status === "ACCEPTED" && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate("IN_PROGRESS")}
                  disabled={updatingStatus}
                  className="w-full mt-8"
                >
                  {updatingStatus ? "Updating..." : "Start Task"}
                </Button>
              )}
              {isAssignedProviderView && request.status === "IN_PROGRESS" && (
                <Button
                  variant="primary"
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  disabled={updatingStatus}
                  className="w-full mt-8"
                >
                  {updatingStatus ? "Updating..." : "Mark Completed"}
                </Button>
              )}
              {isAssignedProviderView && request.status === "COMPLETED" && (
                <p className="font-metadata text-metadata text-on-surface-variant text-center mt-8">
                  Task Completed
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
