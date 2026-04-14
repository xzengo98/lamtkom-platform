import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import AccountClientPage, {
  type ActiveSession,
  type Profile,
} from "../../components/account/account-client";

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profileData }, { data: sessionsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, username, phone, role, games_remaining, games_played, created_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("game_sessions")
      .select(
        "id, game_name, team_one_name, team_two_name, team_one_score, team_two_score, created_at, status",
      )
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  const profile = (profileData as Profile | null) ?? null;
  const activeSessions = Array.isArray(sessionsData)
    ? (sessionsData as ActiveSession[])
    : [];

  return (
    <AccountClientPage
      initialProfile={profile}
      initialActiveSessions={activeSessions}
      initialUserId={user.id}
    />
  );
}
