import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Maintains exactly one Socket.IO connection for the whole app, opened only
// while the user is logged in, authenticated with the same JWT already used
// for REST calls. Real-time updates are a convenience layer on top of the
// REST API — if the socket fails to connect or drops, the rest of the app
// (all existing Phase 1-6 functionality) keeps working normally over REST.
export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setSocket(null);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSocket(null);
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
    });

    // Swallow connection/auth failures here — never let a real-time hiccup
    // throw inside React or block any REST-backed page from working.
    newSocket.on("connect_error", () => {});

    setSocket(newSocket);

    return () => {
      newSocket.close();
      setSocket(null);
    };
    // Re-run only when login state changes, not on every render/navigation
    // — this is what keeps it to a single connection per session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

// Raw access to the current socket (or null if not connected/not logged
// in). Most components should prefer useSocketEvent below instead.
export function useSocket() {
  return useContext(SocketContext);
}

// Subscribes to one named event on the shared socket for as long as the
// calling component is mounted. Safe to call even before the socket has
// connected yet — it attaches once `socket` becomes available and cleans
// up automatically on unmount. The handler is always the latest one passed
// in, without needing to reconnect the listener on every render.
export function useSocketEvent(eventName, handler) {
  const socket = useSocket();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return undefined;

    const listener = (...args) => handlerRef.current(...args);
    socket.on(eventName, listener);

    return () => {
      socket.off(eventName, listener);
    };
  }, [socket, eventName]);
}
