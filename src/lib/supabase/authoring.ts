import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { dateBounds, localDateKey } from '@/lib/replay';
export async function requireAuthoringContract() {
  const { data, error } = await createAdminSupabaseClient().rpc('backend_contract_version');
  if (error || data !== 1)
    throw new Error('Backend contract v1 required');
  if (!process.env.WCL_AUTHORING_DATASET_VERSION?.trim())
    throw new Error('Explicit authoring dataset version required');
}
export async function getAuthoringMatchesForLocalDate(dateKey = localDateKey(new Date())) {
  const { start, end } = dateBounds(dateKey);
  const { data, error } = await createAdminSupabaseClient().from('matches').select('id,status_short,home_team:teams!matches_home_team_id_fkey(name),away_team:teams!matches_away_team_id_fkey(name)').eq('external_provider', 'api-football').gte('kickoff_at', start).lt('kickoff_at', end).order('kickoff_at');
  if (error)
    throw new Error('Authoring fixture lookup failed');
  return (data ?? []) as unknown as {
    id: string;
    status_short: string | null;
    home_team: {
      name: string;
    };
    away_team: {
      name: string;
    };
  }[];
}
