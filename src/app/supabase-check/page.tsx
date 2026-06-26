import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function SupabaseCheckPage() {
  const supabase = createServerSupabaseClient();

  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, code, group_name")
    .order("name");

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Supabase check failed</h1>
        <pre className="mt-4 whitespace-pre-wrap text-sm text-red-700">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Supabase connection works</h1>

      <pre className="mt-6 overflow-auto rounded-xl bg-slate-100 p-4 text-sm">
        {JSON.stringify(teams, null, 2)}
      </pre>
    </main>
  );
}
