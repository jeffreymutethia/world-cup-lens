// Calendar dates are not instants. In particular, never infer a kickoff from one.
export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function formatEventDate(value: string) {
  if (!isDateKey(value)) return "Date unavailable";
  const [year, month, day] = value.split("-");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[Number(month) - 1]} ${Number(day)}, ${year}`;
}
