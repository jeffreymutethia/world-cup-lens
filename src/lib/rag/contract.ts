import { createHash } from 'node:crypto';
import { z } from 'zod';
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_VERSION = 'openai-small-1536-v1';
export const EMBEDDING_DIMENSIONS = 1536;
export const PROMPT_VERSION = 'evidence-only-v1';
export const SCHEMA_VERSION = 'qualitative-lens-v1';
export const CHUNKER_VERSION = 'paragraph-v1';
export function validateEmbedding(value: unknown): number[] {
  if (!Array.isArray(value) || value.length !== EMBEDDING_DIMENSIONS || value.some(n => typeof n !== 'number' || !Number.isFinite(n)) || !value.some(n => n !== 0))
    throw new Error('Invalid embedding');
  return value as number[];
}
export function validateEmbeddingBatch(rows: {
  index: number;
  embedding: unknown;
}[], count: number): number[][] {
  if (rows.length !== count || new Set(rows.map(r => r.index)).size !== count || rows.some(r => !Number.isInteger(r.index) || r.index < 0 || r.index >= count))
    throw new Error('Invalid embedding response indices');
  return [...rows].sort((a, b) => a.index - b.index).map(r => validateEmbedding(r.embedding));
}
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'string')
    return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value))
    return JSON.stringify(value);
  if (Array.isArray(value))
    return `[${value.map(canonicalJson).join(',')}]`;
  if (typeof value === 'object' && value)
    return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  throw new Error('Non-JSON identity');
}
export function cacheKey(identityCanonical: string) { return createHash('sha256').update(identityCanonical).digest('hex'); }
const timestamp = z.iso.datetime({ offset: true });
export const ContextSchema = z.object({
  id: z.uuid(), document_id: z.uuid(), title: z.string().min(4).max(100), doc_type: z.string().min(1), content: z.string().min(15), source_url: z.url().regex(/^https?:\/\//).nullable(), similarity: z.number().min(-1).max(1),
  document_version_id: z.uuid(), content_hash: z.string().regex(/^[a-f0-9]{64}$/), input_hash: z.string().regex(/^[a-f0-9]{64}$/), dataset_version: z.string().min(1), source_identity: z.string().nullable(),
  published_at: timestamp.nullable(), captured_at: timestamp.nullable(), availability_verified: z.boolean(), embedding_model: z.string().min(1), embedding_version: z.string().min(1),
}).strict();
export type Context = z.infer<typeof ContextSchema>;
export const SnapshotSchema = z.object({
  match: z.object({ id: z.string().min(1), home_team_id: z.string().min(1), away_team_id: z.string().min(1), venue_id: z.string().min(1), kickoff_at: timestamp, group_name: z.string(), known_at: timestamp.nullable().optional(), knowledge_evidence: z.string().nullable().optional() }),
  home: z.object({ id: z.string().min(1), name: z.string().min(1) }), away: z.object({ id: z.string().min(1), name: z.string().min(1) }),
  venue: z.object({ id: z.string().min(1), name: z.string().min(1), city: z.string(), country: z.string() }),
});
export type Snapshot = z.infer<typeof SnapshotSchema>;
export type InputAttestation = {
  inputFingerprint: string;
  availableAt: string;
  evidence: string;
};
export function safeMatchInput(snapshot: Snapshot, cutoff: string | null, retrievedAt: string, fingerprint?: string, attestation?: InputAttestation) {
  const { match, home, away, venue } = SnapshotSchema.parse(snapshot);
  if (home.id !== match.home_team_id || away.id !== match.away_team_id || venue.id !== match.venue_id || home.id === away.id)
    throw new Error('Invalid match identities');
  if (cutoff !== null) {
    if (!attestation || attestation.inputFingerprint !== fingerprint || !timestamp.safeParse(attestation.availableAt).success || Date.parse(attestation.availableAt) > Date.parse(cutoff) || !attestation.evidence.trim() || !timestamp.safeParse(cutoff).success || !match.known_at || !match.knowledge_evidence?.trim() || !Number.isFinite(Date.parse(match.known_at)) || Date.parse(match.known_at) > Date.parse(cutoff) || Date.parse(cutoff) >= Date.parse(match.kickoff_at) || Date.parse(cutoff) > Date.parse(retrievedAt))
      throw new Error('Unestablished historical input');
  }
  // Allowlist only. Never pass final results, mutable summaries, strengths or current status to a forecast.
  return { matchId: match.id, home: { id: home.id, name: home.name }, away: { id: away.id, name: away.name }, venue: { id: venue.id, name: venue.name, city: venue.city, country: venue.country }, stage: match.group_name, eventTime: match.kickoff_at };
}
