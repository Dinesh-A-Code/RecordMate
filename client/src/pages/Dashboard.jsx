import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ModeSwitch from "../components/ModeSwitch";
import Button from "../components/Button";

// Same four actions that already existed in the pre-redesign Dashboard —
// only their presentation changes here, not the set of routes/labels.
const REQUESTER_ACTIONS = [
  { to: "/requests/create", title: "Create Record Request", description: "Post a new record-writing task." },
  { to: "/requests/my", title: "My Requests", description: "View and manage your requests." },
];

const PROVIDER_ACTIONS = [
  { to: "/requests/nearby", title: "Find Nearby Requests", description: "Browse open record requests near you." },
  { to: "/requests/accepted", title: "My Accepted Tasks", description: "Track tasks you're working on." },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const mode = user?.mode || "REQUESTER";
  const isRequester = mode === "REQUESTER";

  const actions = isRequester ? REQUESTER_ACTIONS : PROVIDER_ACTIONS;
  // The first action for each mode doubles as the hero's primary call to
  // action — same route as the first quick-action row below, just also
  // surfaced prominently up top.
  const primaryAction = actions[0];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="max-w-2xl mx-auto">
          {/* 1. Hero / welcome — typography-led, no card container */}
          <section className="pt-10 md:pt-14 pb-8 md:pb-10">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-3">
              RecordMate / Dashboard
            </p>
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-3">
              Welcome, {user?.name}.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-6">
              {isRequester
                ? "Post a record-writing task and find a nearby student to help you finish it."
                : "Browse nearby record-writing requests and pick up work that fits your schedule."}
            </p>
            <Button variant="primary" onClick={() => navigate(primaryAction.to)}>
              {isRequester ? "+ Create Request" : "Find Nearby Requests"}
            </Button>
          </section>

          {/* 2. Mode — reuses ModeSwitch as-is, just wrapped editorially */}
          <section className="border-t border-outline-variant/30 py-8">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-4">
              Mode
            </p>
            <ModeSwitch />
          </section>

          {/* 3. Quick actions — hairline-divided rows instead of shadow cards */}
          <section className="border-t border-b border-outline-variant/30 py-8 mb-10">
            <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant mb-4">
              Quick Actions
            </p>
            <div className="divide-y divide-outline-variant/30 border-t border-outline-variant/30">
              {actions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between gap-4 py-4 px-2 -mx-2 hover:bg-surface-container-low transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-body-md text-body-md font-semibold text-on-surface">
                      {action.title}
                    </p>
                    <p className="font-metadata text-metadata text-on-surface-variant mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  <span className="text-on-surface-variant text-lg shrink-0">→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
