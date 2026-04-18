export const notificationTypes = [
  "announcement",
  "games_added",
  "game_created",
  "game_consumed",
  "low_balance",
  "balance_empty",
  "role_changed",
  "system",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

export const notificationAudienceTypes = ["all", "role", "users"] as const;

export type NotificationAudienceType =
  (typeof notificationAudienceTypes)[number];

export type NotificationRoleTarget = "admin" | "premium" | "user";

export type NotificationPayload = Record<string, unknown>;

export type CreateNotificationForUserInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string | null;
  payload?: NotificationPayload;
  campaignId?: string | null;
};

export type CreateCampaignAndDispatchInput = {
  createdBy: string;
  category: NotificationType;
  audienceType: NotificationAudienceType;
  audienceRole?: NotificationRoleTarget | null;
  userIds?: string[];
  title: string;
  body: string;
  actionUrl?: string | null;
  payload?: NotificationPayload;
};

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url: string | null;
  payload: NotificationPayload;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  campaign_id: string | null;
};