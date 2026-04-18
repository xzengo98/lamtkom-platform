"use server";

import { revalidatePath } from "next/cache";
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