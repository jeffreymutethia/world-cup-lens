import { createHash } from 'node:crypto';
export function providerDocumentId(kind: 'team_profile' | 'venue_profile', entityId: string) {
  const hex = createHash('sha256').update(JSON.stringify(['api-football', kind, entityId])).digest('hex');
  // RFC 9562 custom UUID v8, stable across concurrent initial syncs.
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-8${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
export function documentCaptureTime(existing: {
  body: string;
  captured_at: string | null;
} | undefined, body: string, now: string) {
  return existing?.body === body && existing.captured_at ? existing.captured_at : now;
}
export function isCanonicalProviderProfile(row: {
  doc_type: string;
  team_id: string | null;
  venue_id: string | null;
  match_id: string | null;
}) {
  return row.match_id === null && ((row.doc_type === 'team_profile' && row.team_id !== null && row.venue_id === null) || (row.doc_type === 'venue_profile' && row.venue_id !== null && row.team_id === null));
}
