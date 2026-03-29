"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeCodenamesWord } from "@/lib/codenames/normalize";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

export async function createCodenamesWord(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const word = getString(formData, "word");
  const language = getString(formData, "language") || "ar";
  const category = getString(formData, "category") || null;
  const isActive = getBoolean(formData, "is_active");

  if (!word) {
    throw new Error("الكلمة مطلوبة");
  }

  const normalizedWord = normalizeCodenamesWord(word);

  const { error } = await supabase.from("codenames_word_bank").insert({
    word,
    normalized_word: normalizedWord,
    language,
    category,
    is_active: isActive,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/codenames");
  revalidatePath("/admin/codenames/words");
  revalidatePath("/admin/codenames/upload");
}

export async function updateCodenamesWord(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const id = getString(formData, "id");
  const word = getString(formData, "word");
  const language = getString(formData, "language") || "ar";
  const category = getString(formData, "category") || null;
  const isActive = getBoolean(formData, "is_active");

  if (!id) {
    throw new Error("معرف الكلمة مفقود");
  }

  if (!word) {
    throw new Error("الكلمة مطلوبة");
  }

  const normalizedWord = normalizeCodenamesWord(word);

  const { error } = await supabase
    .from("codenames_word_bank")
    .update({
      word,
      normalized_word: normalizedWord,
      language,
      category,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/codenames");
  revalidatePath("/admin/codenames/words");
  revalidatePath("/admin/codenames/upload");
}

export async function deleteCodenamesWord(formData: FormData) {
  const supabase = await getSupabaseServerClient();
  const id = getString(formData, "id");

  if (!id) return;

  const { error } = await supabase
    .from("codenames_word_bank")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/codenames");
  revalidatePath("/admin/codenames/words");
  revalidatePath("/admin/codenames/upload");
}

export async function toggleCodenamesWordStatus(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const id = getString(formData, "id");
  const current = getString(formData, "current");

  if (!id) return;

  const nextValue = current !== "true";

  const { error } = await supabase
    .from("codenames_word_bank")
    .update({
      is_active: nextValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/codenames");
  revalidatePath("/admin/codenames/words");
}