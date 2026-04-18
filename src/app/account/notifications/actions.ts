"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  markAllMyNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/notifications/server";

export async function markOneNotificationReadAction(formData: FormData) {
  const notificationId = String(formData.get("notificationId") ?? "").trim();

  if (!notificationId) return;

  await markNotificationAsRead(notificationId);

  revalidatePath("/account/notifications");
  revalidatePath("/account");
  revalidatePath("/");
}

export async function markAllNotificationsReadAction() {
  await markAllMyNotificationsAsRead();

  revalidatePath("/account/notifications");
  revalidatePath("/account");
  revalidatePath("/");
}

export async function deleteOneNotificationAction(formData: FormData) {
  const notificationId = String(formData.get("notificationId") ?? "").trim();

  if (!notificationId) return;

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  revalidatePath("/account/notifications");
  revalidatePath("/account");
  revalidatePath("/");
}