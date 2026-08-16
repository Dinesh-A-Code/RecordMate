import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAcceptedRequestsRequest } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";

export default function MyAcceptedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAcceptedRequestsRequest()
      .then(setTasks)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">My Accepted Tasks</h2>
          <Link to="/requests/nearby" className="text-sm text-blue-600 hover:underline">
            Find More
          </Link>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500 text-sm">
            You haven't accepted any tasks yet.
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                to={`/requests/${task.id}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-gray-800">{task.recordType}</p>
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-sm text-gray-500">{task.subject}</p>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>{task.pages} pages</span>
                  <span>₹{task.payment}</span>
                  <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{task.college || "Unknown college"}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
