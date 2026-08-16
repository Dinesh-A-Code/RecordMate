import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ModeSwitch from "../components/ModeSwitch";

export default function Dashboard() {
  const { user } = useAuth();
  const mode = user?.mode || "REQUESTER";
  const isRequester = mode === "REQUESTER";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-xl mx-auto p-6 space-y-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Welcome, {user?.name}
          </h2>
          <p className="text-sm text-gray-500">
            {isRequester ? "Need a Writer" : "Want to Write"}
          </p>
        </div>

        <ModeSwitch />

        {isRequester ? (
          <div className="space-y-3">
            <Link
              to="/requests/create"
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <p className="font-medium text-gray-800">Create Record Request</p>
              <p className="text-sm text-gray-400 mt-1">Post a new record-writing task.</p>
            </Link>
            <Link
              to="/requests/my"
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <p className="font-medium text-gray-800">My Requests</p>
              <p className="text-sm text-gray-400 mt-1">View and manage your requests.</p>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              to="/requests/nearby"
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <p className="font-medium text-gray-800">Find Nearby Requests</p>
              <p className="text-sm text-gray-400 mt-1">
                Browse open record requests near you.
              </p>
            </Link>
            <Link
              to="/requests/accepted"
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <p className="font-medium text-gray-800">My Accepted Tasks</p>
              <p className="text-sm text-gray-400 mt-1">Track tasks you're working on.</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
