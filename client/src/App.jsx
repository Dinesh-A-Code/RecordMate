import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import RealtimeNotifications from "./components/RealtimeNotifications";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateRequest from "./pages/CreateRequest";
import MyRequests from "./pages/MyRequests";
import MyAcceptedTasks from "./pages/MyAcceptedTasks";
import NearbyRequests from "./pages/NearbyRequests";
import RequestDetail from "./pages/RequestDetail";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <RealtimeNotifications />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/create"
                element={
                  <ProtectedRoute>
                    <CreateRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/my"
                element={
                  <ProtectedRoute>
                    <MyRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/nearby"
                element={
                  <ProtectedRoute>
                    <NearbyRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/accepted"
                element={
                  <ProtectedRoute>
                    <MyAcceptedTasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/requests/:id"
                element={
                  <ProtectedRoute>
                    <RequestDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
