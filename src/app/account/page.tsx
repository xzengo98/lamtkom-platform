import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import AccountClientPage, {
  type ActiveSession,
  type CouponRedemption,
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

  const [{ data: profileData }, { data: sessionsData }, { data: redemptionsData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, email, username, phone, role, account_tier, games_remaining, games_played, created_at",
        )
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
      supabase
        .from("coupon_redemptions")
        .select(
          "id, code_snapshot, reward_type_snapshot, target_game_snapshot, games_amount_snapshot, target_tier_snapshot, redeemed_at",
        )
        .eq("user_id", user.id)
        .order("redeemed_at", { ascending: false })
        .limit(6),
    ]);

  const profile = (profileData as Profile | null) ?? null;
  const activeSessions = Array.isArray(sessionsData)
    ? (sessionsData as ActiveSession[])
    : [];
  const couponRedemptions = Array.isArray(redemptionsData)
    ? (redemptionsData as CouponRedemption[])
    : [];

  return (
    <AccountClientPage
      initialProfile={profile}
      initialActiveSessions={activeSessions}
      initialCouponRedemptions={couponRedemptions}
      initialUserId={user.id}
    />
  );
}