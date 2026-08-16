import { useSocketEvent } from "../context/SocketContext";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

// Requester-facing messages for each status a request can move to after
// creation. Keyed by the "status" field on the request:updated payload.
const STATUS_MESSAGES = {
  ACCEPTED: (r) => `Your ${r.subject} ${r.recordType} was accepted.`,
  IN_PROGRESS: (r) => `Your ${r.subject} ${r.recordType} has started.`,
  COMPLETED: (r) => `Your ${r.subject} ${r.recordType} has been completed.`,
};

// Renders nothing itself — just wires the two socket events that should
// produce a toast, anywhere in the app, regardless of which page is open.
// Mounted once near the app root, inside both SocketProvider and
// NotificationProvider.
export default function RealtimeNotifications() {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Broadcast to everyone — only meaningful to a provider currently
  // browsing for work, so gate it client-side on the viewer's own mode.
  useSocketEvent("request:new", () => {
    if (user?.mode === "PROVIDER") {
      showNotification("A nearby record request is available.");
    }
  });

  // Only ever sent to the requester who owns the request (see server/socket.js
  // emitToUser), so no additional role check is needed here.
  useSocketEvent("request:updated", (payload) => {
    const buildMessage = STATUS_MESSAGES[payload?.status];
    if (buildMessage) {
      showNotification(buildMessage(payload));
    }
  });

  return null;
}
