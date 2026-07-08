import {
  Outlet,
  Link,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  ListTodo,
  FileText,
  Package,
  MicVocal,
  UtensilsCrossed,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", basePath: "/dashboard", Icon: LayoutDashboard },
  { label: "Divisi", basePath: "/divisions", Icon: Users },
  { label: "Timeline", basePath: "/timeline", Icon: Calendar },
];

const ACARA_ITEMS = [
  { label: "Rundown", basePath: "/acara/rundown", Icon: ListTodo },
  { label: "Juknis & Juklak", basePath: "/acara/juknis", Icon: FileText },
  { label: "Perlengkapan", basePath: "/acara/perlengkapan", Icon: Package },
  { label: "MC & Petugas", basePath: "/acara/mc", Icon: MicVocal },
  { label: "Konsumsi", basePath: "/acara/konsumsi", Icon: UtensilsCrossed },
  { label: "Pengguna", basePath: "/users", Icon: Settings },
];

export function JuruladenLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventSlug } = useParams();
  const user = JSON.parse(localStorage.getItem("juruladen_user") || "null");

  const eventPath = eventSlug ? `/${eventSlug}` : "";

  const handleLogout = () => {
    localStorage.removeItem("juruladen_token");
    localStorage.removeItem("juruladen_user");
    navigate("/login");
  };

  const linkTo = (basePath: string) => {
    if (basePath === "/users") return basePath;
    return `${basePath}${eventPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-700">Juruladen</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-600">
                {user.name}{" "}
                <span className="text-xs text-gray-400">({user.role})</span>
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex">
        <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)] p-3 gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, basePath, Icon }) => {
            const isActive = location.pathname.startsWith(basePath);
            return (
              <Link
                key={basePath}
                to={linkTo(basePath)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Acara
            </p>
          </div>
          {ACARA_ITEMS.map(({ label, basePath, Icon }) => {
            const isActive = location.pathname.startsWith(basePath);
            return (
              <Link
                key={basePath}
                to={linkTo(basePath)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </aside>

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Bottom navbar (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around py-2 overflow-x-auto">
          {[...NAV_ITEMS, ...ACARA_ITEMS]
            .slice(0, 6)
            .map(({ label, basePath, Icon }) => {
              const isActive = location.pathname.startsWith(basePath);
              return (
                <Link
                  key={basePath}
                  to={linkTo(basePath)}
                  className={`flex flex-col items-center gap-0.5 text-xs flex-shrink-0 px-1 ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  {label}
                </Link>
              );
            })}
        </div>
      </nav>
    </div>
  );
}
