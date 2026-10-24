"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { configProfiles } from "./db/schema";

export async function getPresetData() {
  try {
    const presets = await db
      .select()
      .from(configProfiles)
      .orderBy(desc(configProfiles.isActive));

    return { success: true, data: presets };
  } catch (error) {
    console.error("Failed to fetch presets:", error);
    return { success: false, data: [] };
  }
}

export async function deletePreset(
  presetId: string,
): Promise<{ success: boolean; data: string }> {
  try {
    const [deleted] = await db
      .delete(configProfiles)
      .where(eq(configProfiles.id, presetId))
      .returning({ name: configProfiles.profileName });

    const presetName = deleted?.name || "Preset";
    return { success: true, data: `${presetName} was successfully deleted.` };
  } catch (error) {
    console.error("Failed to delete preset:", error);
    return { success: false, data: "Failed to delete preset" };
  }
}
