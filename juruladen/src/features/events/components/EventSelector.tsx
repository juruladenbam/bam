import { useEvents } from "../hooks/useEvent";
import { useNavigate, useParams, useLocation } from "react-router-dom";

export function EventSelector() {
  const { data: events, isLoading } = useEvents();
  const { eventSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading)
    return <div className="h-9 w-48 bg-gray-200 animate-pulse rounded-lg" />;

  const handleChange = (newSlug: string) => {
    if (!newSlug) return;
    // Preserve current page, just replace event slug
    const pathParts = location.pathname.split("/");
    // Path pattern: /{page}/{eventSlug}[/...]
    if (pathParts.length >= 3) {
      pathParts[2] = newSlug;
      navigate(pathParts.join("/"));
    } else {
      navigate(`/dashboard/${newSlug}`);
    }
  };

  return (
    <select
      value={eventSlug || ""}
      onChange={(e) => handleChange(e.target.value)}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Pilih Acara...</option>
      {events?.map((event) => (
        <option key={event.id} value={event.slug}>
          {event.name} (
          {event.start_date ? new Date(event.start_date).getFullYear() : "-"})
        </option>
      ))}
    </select>
  );
}
