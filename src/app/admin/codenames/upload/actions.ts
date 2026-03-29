"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  normalizeCodenamesWord,
  splitWordsFromTextarea,
} from "@/lib/codenames/normalize";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

type ExistingWordRow = {
  normalized_word: string;
};

export async function bulkUploadCodenamesWords(formData: FormData) {
  const supabase = await getSupabaseServerClient();

  const rawWords = getString(formData, "words");
  const language = getString(formData, "language") || "ar";
  const category = getString(formData, "category") || null;
  const isActive = getString(formData, "is_active") === "true";

  if (!rawWords) {
    throw new Error("أدخل الكلمات أولاً");
  }

  const words = splitWordsFromTextarea(rawWords);

  if (!words.length) {
    throw new Error("لم يتم العثور على كلمات صالحة");
  }

  const uniqueMap = new Map<string, string>();

  for (const word of words) {
    const normalized = normalizeCodenamesWord(word);
    if (!normalized) continue;

    if (!uniqueMap.has(normalized)) {
      uniqueMap.set(normalized, word);
    }
  }

  const normalizedWords = Array.from(uniqueMap.keys());

  const { data: existingRows, error: existingError } = await supabase
    .from("codenames_word_bank")
    .select("normalized_word")
    .in("normalized_word", normalizedWords)
    .eq("language", language);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingSet = new Set(
    ((existingRows ?? []) as ExistingWordRow[]).map(
      (item: ExistingWordRow) => item.normalized_word
    )
  );

  const rowsToInsert = normalizedWords
    .filter((normalized) => !existingSet.has(normalized))
    .map((normalized) => ({
      word: uniqueMap.get(normalized)!,
      normalized_word: normalized,
      language,
      category,
      is_active: isActive,
    }));

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("codenames_word_bank")
      .insert(rowsToInsert);

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  revalidatePath("/admin/codenames");
  revalidatePath("/admin/codenames/words");
  revalidatePath("/admin/codenames/upload");
}