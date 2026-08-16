import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Stitch TopNavBar treatment, adapted to stay in normal document flow
// (not fixed/sticky) — the existing pages don't reserve top padding for a
// fixed header, and those pages are out of scope this phase, so a fixed
// navbar would overlap their content. Same reasoning applies to the
// backdrop-blur effect, which only makes sense over scrolling content
// behind a fixed element.
//
// Sizing uses padding rather than Stitch's fixed h-16, and the row is
// allowed to wrap (flex-wrap) — at Stitch's full scale ("RecordMate" at
// 32px plus three nav items) everything doesn't reliably fit on one line
// on narrow phones. This keeps the intended large editorial wordmark from
// `md:` up while guaranteeing no horizontal overflow below it: if it ever
// doesn't fit, it wraps to a second line instead of causing scroll.
const linkClass = ({ isActive }) =>
  `text-sm md:text-body-md md:font-body-md py-2 border-b-2 transition-colors ${
    isActive
      ? "text-primary font-bold border-primary"
      : "text-on-surface-variant border-transparent hover:text-primary"
  }`;

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-surface border-b border-outline-variant/30">
      <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2 px-margin-mobile md:px-margin-desktop py-3 max-w-container-max mx-auto">
        <span className="text-xl font-bold md:font-display-lg-mobile md:text-display-lg-mobile text-primary tracking-tight">
          RecordMate
        </span>
        <nav className="flex items-center gap-3 md:gap-8 flex-wrap">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="text-sm md:text-body-md md:font-body-md text-primary hover:opacity-70 transition-opacity cursor-pointer"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
