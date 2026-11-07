// Private provider timestamps are instants; public curated dates remain date-only.
export function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric",
    minute: "2-digit", timeZoneName: "short", timeZone: "America/Los_Angeles",
  }).format(new Date(iso));
}
