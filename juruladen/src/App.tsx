import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JuruladenLayout } from "./components/layout/JuruladenLayout";
import { useEvents } from "./features/events/hooks/useEvent";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EventListPage from "./pages/events/EventListPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import DivisionsPage from "./pages/divisions/DivisionsPage";
import DivisionDetailPage from "./pages/divisions/DivisionDetailPage";
import TimelinePage from "./pages/TimelinePage";
import UserManagementPage from "./pages/UserManagementPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("juruladen_token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Redirect empty route to default active event.
 * e.g., /dashboard → /dashboard/festival-bam-2027
 */
function DefaultEventRedirect({ basePath }: { basePath: string }) {
  const { data: events, isLoading } = useEvents();
  if (isLoading) return null;

  const now = new Date();
  const active =
    events?.find(
      (e) => new Date(e.start_date) <= now && new Date(e.end_date) >= now,
    ) ??
    events?.find((e) => new Date(e.start_date) > now) ??
    events?.[0];

  if (!active) return null;
  return <Navigate to={`${basePath}/${active.slug}`} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <JuruladenLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={<DefaultEventRedirect basePath="/dashboard" />}
            />
            <Route path="dashboard/:eventSlug" element={<DashboardPage />} />

            <Route path="events" element={<EventListPage />} />
            <Route path="events/:eventSlug" element={<EventDetailPage />} />

            <Route
              path="divisions"
              element={<DefaultEventRedirect basePath="/divisions" />}
            />
            <Route path="divisions/:eventSlug" element={<DivisionsPage />} />
            <Route
              path="divisions/detail/:divisionId"
              element={<DivisionDetailPage />}
            />

            <Route
              path="timeline"
              element={<DefaultEventRedirect basePath="/timeline" />}
            />
            <Route path="timeline/:eventSlug" element={<TimelinePage />} />

            <Route path="users" element={<UserManagementPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
