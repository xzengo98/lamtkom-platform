import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  CreateCampaignAndDispatchInput,
  CreateNotificationForUserInput,
  NotificationListItem,
  NotificationPayload,
} from "./types";

type ProfileIdRow = {
  id: string;
};

function normalizeText(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function normalizePayload(payload?: NotificationPayload) {
  return payload ?? {};
}

function dedupeIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export async function createNotificationForUser(
  input: CreateNotificationForUserInput,
) {
  const admin = getSupabaseAdminClient();

  const title = normalizeText(input.title, 140);
  const body = normalizeText(input.body, 1000);

  if (!input.userId || !title || !body) {
    throw new Error("Missing required notification fields");
  }

  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: input.userId,
      campaign_id: input.campaignId ?? null,
      type: input.type,
      title,
      body,
      action_url: input.actionUrl ?? null,
      payload: normalizePayload(input.payload),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create notification");
  }

  return data;
}

async function resolveRecipientIds(params: {
  audienceType: CreateCampaignAndDispatchInput["audienceType"];
  audienceRole?: CreateCampaignAndDispatchInput["audienceRole"];
  userIds?: string[];
}) {
  const admin = getSupabaseAdminClient();

  if (params.audienceType === "users") {
    return dedupeIds(params.userIds ?? []);
  }

  if (params.audienceType === "role") {
    if (!params.audienceRole) {
      throw new Error("audienceRole is required when audienceType = role");
    }

    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .eq("role", params.audienceRole);

    if (error) {
      throw new Error(error.message || "Failed to resolve role recipients");
    }

    const rows = (data ?? []) as ProfileIdRow[];
    return dedupeIds(rows.map((row: ProfileIdRow) => String(row.id)));
  }

  const { data, error } = await admin.from("profiles").select("id");

  if (error) {
    throw new Error(error.message || "Failed to resolve all recipients");
  }

  const rows = (data ?? []) as ProfileIdRow[];
  return dedupeIds(rows.map((row: ProfileIdRow) => String(row.id)));
}

export async function createCampaignAndDispatch(
  input: CreateCampaignAndDispatchInput,
) {
  const admin = getSupabaseAdminClient();

  const title = normalizeText(input.title, 140);
  const body = normalizeText(input.body, 1000);

  if (!input.createdBy || !title || !body) {
    throw new Error("Missing required campaign fields");
  }

  const { data: campaign, error: campaignError } = await admin
    .from("notification_campaigns")
    .insert({
      created_by: input.createdBy,
      category: input.category,
      audience_type: input.audienceType,
      audience_role: input.audienceRole ?? null,
      title,
      body,
      action_url: input.actionUrl ?? null,
      payload: normalizePayload(input.payload),
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    throw new Error(campaignError?.message || "Failed to create campaign");
  }

  const recipientIds = await resolveRecipientIds({
    audienceType: input.audienceType,
    audienceRole: input.audienceRole,
    userIds: input.userIds,
  });

  if (recipientIds.length === 0) {
    return {
      campaignId: campaign.id,
      recipientCount: 0,
    };
  }

  const notificationRows = recipientIds.map((userId) => ({
    user_id: userId,
    campaign_id: campaign.id,
    type: input.category,
    title,
    body,
    action_url: input.actionUrl ?? null,
    payload: normalizePayload(input.payload),
  }));

  const chunks = chunkArray(notificationRows, 500);

  for (const chunk of chunks) {
    const { error } = await admin.from("notifications").insert(chunk);

    if (error) {
      throw new Error(error.message || "Failed to dispatch notifications");
    }
  }

  return {
    campaignId: campaign.id,
    recipientCount: recipientIds.length,
  };
}

export async function getMyUnreadNotificationsCount() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message || "Failed to get unread notifications count");
  }

  return count ?? 0;
}

export async function getMyNotifications(options?: {
  limit?: number;
  onlyUnread?: boolean;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [] as NotificationListItem[];

  const limit = Math.min(Math.max(options?.limit ?? 20, 1), 100);

  let query = supabase
    .from("notifications")
    .select(
      "id, type, title, body, action_url, payload, is_read, read_at, created_at, campaign_id",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.onlyUnread) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to fetch notifications");
  }

  return (data ?? []) as NotificationListItem[];
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .eq("is_read", false)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Failed to mark notification as read");
  }

  return data;
}

export async function markAllMyNotificationsAsRead() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message || "Failed to mark all notifications as read");
  }

  return true;
}

export async function createAutomaticGameCreatedNotifications(params: {
  userId: string;
  gameName: string;
  remainingGames: number;
  sessionId: string;
}) {
  await createNotificationForUser({
    userId: params.userId,
    type: "game_created",
    title: "تم إنشاء لعبة جديدة",
    body: `تم إنشاء لعبة "${params.gameName}" بنجاح. المتبقي في حسابك: ${params.remainingGames} لعبة.`,
    actionUrl: `/game/board?sessionId=${params.sessionId}`,
    payload: {
      gameName: params.gameName,
      remainingGames: params.remainingGames,
      sessionId: params.sessionId,
    },
  });

  await createNotificationForUser({
    userId: params.userId,
    type: "game_consumed",
    title: "تم خصم لعبة من رصيدك",
    body: `تم استخدام لعبة واحدة من رصيدك. المتبقي الآن: ${params.remainingGames} لعبة.`,
    actionUrl: "/account",
    payload: {
      remainingGames: params.remainingGames,
      sessionId: params.sessionId,
    },
  });

  if (params.remainingGames === 0) {
    await createNotificationForUser({
      userId: params.userId,
      type: "balance_empty",
      title: "نفد رصيد الألعاب",
      body: "لم يعد لديك ألعاب متبقية في حسابك حاليًا.",
      actionUrl: "/pricing",
      payload: {
        remainingGames: 0,
      },
    });
  } else if (params.remainingGames <= 3) {
    await createNotificationForUser({
      userId: params.userId,
      type: "low_balance",
      title: "رصيدك منخفض",
      body: `بقي لديك ${params.remainingGames} لعبة فقط في حسابك.`,
      actionUrl: "/pricing",
      payload: {
        remainingGames: params.remainingGames,
      },
    });
  }
}