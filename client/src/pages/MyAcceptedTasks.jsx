import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAcceptedRequestsRequest } from "../services/requestService";
import { getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/Button";

export default function MyAcceptedTasks() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto py-10 md:py-14">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-3">
                RecordMate / Accepted Tasks
              </p>
              <h1 className="font-headline-md text-headline-md text-on-surface">My Accepted Tasks</h1>
            </div>
            <Button variant="secondary" onClick={() => navigate("/requests/nearby")}>
              Find More
            </Button>
          </div>

          {error && (
            <div className="mb-6 font-metadata text-metadata text-error bg-error/10 border border-error/20 rounded-DEFAULT px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <p className="font-metadata text-metadata text-on-surface-variant">Loading...</p>
          ) : tasks.length === 0 ? (
            <div className="border border-outline-variant/30 bg-surface-container-low px-6 py-16 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                You haven't accepted any tasks yet.
              </p>
              <Button variant="primary" onClick={() => navigate("/requests/nearby")}>
                Find nearby requests
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/requests/${task.id}`}
                  className="block py-5 px-2 -mx-2 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      {task.recordType}
                    </p>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="font-metadata text-metadata text-on-surface-variant">{task.subject}</p>
                  <div className="flex flex-wrap justify-between gap-x-4 font-metadata text-metadata text-on-surface-variant mt-3">
                    <span>{task.pages} pages</span>
                    <span>₹{task.payment}</span>
                    <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                  <p className="font-metadata text-metadata text-on-surface-variant mt-1">
                    {task.college || "Unknown college"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
