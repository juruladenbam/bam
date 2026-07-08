import { useQuery } from "@tanstack/react-query";
import { eventApi } from "../api/eventApi";
import type { JuruladenEvent } from "../../../types";

export function useEvents() {
  return useQuery({
    queryKey: ["juruladen", "events"],
    queryFn: () => eventApi.list().then((r) => r.data),
  });
}

/**
 * Return the default active event for Juruladen.
 * Priority: currently ongoing > upcoming > most recent.
 */
export function useActiveEvent(): JuruladenEvent | null {
  const { data: events } = useEvents();
  if (!events || events.length === 0) return null;

  const now = new Date();

  // 1. Event yang sedang berlangsung
  const ongoing = events.find(
    (e) => new Date(e.start_date) <= now && new Date(e.end_date) >= now,
  );
  if (ongoing) return ongoing;

  // 2. Event mendatang terdekat
  const upcoming = events
    .filter((e) => new Date(e.start_date) > now)
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    );
  if (upcoming.length > 0) return upcoming[0];

  // 3. Fallback: event pertama (paling baru selesai)
  return events[0];
}

export function useEvent(eventId: number | null) {
  return useQuery({
    queryKey: ["juruladen", "events", eventId],
    queryFn: () => eventApi.show(eventId!).then((r) => r.data),
    enabled: !!eventId,
  });
}

export function useEventProgress(eventId: number | null) {
  return useQuery({
    queryKey: ["juruladen", "events", eventId, "progress"],
    queryFn: () => eventApi.progress(eventId!).then((r) => r.data),
    enabled: !!eventId,
  });
}

export function useEventTimeline(
  eventId: number | null,
  params?: {
    division?: string;
    status?: string;
    month?: string;
    assignee_id?: number;
  },
) {
  return useQuery({
    queryKey: ["juruladen", "events", eventId, "timeline", params],
    queryFn: () => eventApi.timeline(eventId!, params).then((r) => r.data),
    enabled: !!eventId,
  });
}
