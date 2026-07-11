import "server-only";

import {
  generateMatchLens,
} from "@/lib/ai/generate-match-lens";
import {
  createAdminSupabaseClient,
} from "@/lib/supabase/admin";
import type {
  MatchViewModel,
} from "@/lib/supabase/repository";

export async function generateAndSaveMatchLens(
  viewModel: MatchViewModel,
) {
  const generated = await generateMatchLens({
    match: viewModel.match,
    homeTeam: viewModel.homeTeam,
    awayTeam: viewModel.awayTeam,
    venue: viewModel.venue,
    group: viewModel.match.group,
    kickoffAt: viewModel.match.kickoffAt,
  });

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("match_lenses")
    .upsert(
      {
        match_id: viewModel.match.id,
        lens_json: generated.lens,
        model: generated.model,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "match_id" },
    );

  if (error) {
    throw new Error(
      `Failed to save generated Match Lens: ${error.message}`,
    );
  }

  return generated;
}
