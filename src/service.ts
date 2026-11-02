"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { configProfiles } from "./db/schema";
import { getAuthenticatedUser } from "./auth/actions";

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

export async function isValidPreset(presetName: string) {
  try {
    const [isPreset] = await db
      .select()
      .from(configProfiles)
      .where(eq(configProfiles.profileName, presetName));

    return !!isPreset;
  } catch (err) {
    return false;
  }
}

export async function perfomSavePreset(
  presetName: string,
  presetDescription: string,
  contentConfig: Record<string, any>,
  presetId?: string,
) {
  if (!presetDescription || !presetName || !contentConfig) {
    return { success: false, data: "Missing required preset fields" };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        data: "Unauthorized: You must be logged in to save a preset.",
      };
    }

    if (!presetId) {
      const nameExists = await isValidPreset(presetName);
      if (nameExists) {
        return {
          success: false,
          data: "A preset with this name already exists.",
        };
      }

      const newPreset = await db
        .insert(configProfiles)
        .values({
          profileName: presetName,
          description: presetDescription,
          contentConfig: contentConfig,
        })
        .returning();
      return { success: true, data: newPreset[0] };
    } else {
      const updatedPreset = await db
        .update(configProfiles)
        .set({
          profileName: presetName,
          description: presetDescription,
          contentConfig: contentConfig,
          updatedAt: new Date(),
        })
        .where(eq(configProfiles.id, presetId))
        .returning();
      return { success: true, data: updatedPreset[0] };
    }
  } catch (err) {
    console.error("Error saving Preset", err);
    return { success: false, data: "Failed to save new Preset" };
  }
}

export async function performPresetActivation(presetId: string) {
  try {
    const isDeactivated = await deactivePresets();

    if (!isDeactivated.success) {
      return { success: false, data: "Failed to activate Preset" };
    }

    const [updatedPreset] = await db
      .update(configProfiles)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(configProfiles.id, presetId))
      .returning();

    if (!updatedPreset) {
      return { success: false, data: "Preset not found." };
    }
    return { success: true, data: updatedPreset };
  } catch (err) {
    console.error("Error Activating Preset", err);
    return { success: false, data: "Failed to activate Preset" };
  }
}
export async function performPresetDeactivation(presetId: string) {
  try {
    const [updatedPreset] = await db
      .update(configProfiles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(configProfiles.id, presetId))
      .returning();

    if (!updatedPreset) {
      return { success: false, data: "Preset not found." };
    }
    return { success: true, data: updatedPreset };
  } catch (err) {
    console.error("Error Deactivating Preset", err);
    return { success: false, data: "Failed to deactivate Preset" };
  }
}

export async function deactivePresets() {
  try {
    await db
      .update(configProfiles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(configProfiles.isActive, true));
    return { success: true, data: "Presets deactivated successfully" };
  } catch (err) {
    console.error("Error Deactivating Preset", err);
    return { success: false, data: "Failed to deactivate Preset" };
  }
}
