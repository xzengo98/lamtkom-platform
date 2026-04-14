import { getSupabaseServerClient } from "../supabase/server";

export type ViewerData = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  username: string | null;
};

type ProfileRow = {
  role: string | null;
  username: string | null;
};

export async function getViewer(): Promise<ViewerData> {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isLoggedIn: false,
      isAdmin: false,
      username: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, username")
    .eq("id", user.id)
    .maybeSingle();

  const typedProfile = (profile as ProfileRow | null) ?? null;

  return {
    isLoggedIn: true,
    isAdmin: typedProfile?.role === "admin",
    username: typedProfile?.username ?? null,
  };
}