"use server";

import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "./db";
import {
  configProfiles,
  gitUserCache,
  reposInformationCache,
} from "./db/schema";
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

const dataExpiresIn = 7;

async function CacheContributionData(
  target: string,
  data: Record<string, any>,
  type: "repo" | "user",
) {
  try {
    const now = new Date();
    if (type === "repo") {
      await db
        .insert(reposInformationCache)
        .values({
          repo: target,
          repoInfo: data["repoData"],
          userContribution: data["contributionData"],
        })
        .onConflictDoUpdate({
          target: reposInformationCache.repo,
          set: {
            repoInfo: data["repoData"],
            userContribution: data["contributionData"],
            createdAt: now,
          },
        });
    } else {
      await db
        .insert(gitUserCache)
        .values({ targetUser: target, userInfo: data })
        .onConflictDoUpdate({
          target: gitUserCache.targetUser,
          set: { userInfo: data, createdAt: now },
        });
    }
  } catch (err) {
    throw new Error("Failed to cache contributions data");
  }
}

async function getCachedData(target: string, type: "repo" | "user") {
  try {
    const CACHE_TTL_MS = dataExpiresIn * 24 * 60 * 60 * 1000;
    const freshThrreshold = new Date(Date.now() - CACHE_TTL_MS);

    if (type === "repo") {
      const records = await db
        .select()
        .from(reposInformationCache)
        .where(
          and(
            eq(reposInformationCache.repo, target),
            gte(reposInformationCache.createdAt, freshThrreshold),
          ),
        );
      return {
        repoData: records[0]?.repoInfo,
        contributionData: records[0]?.userContribution,
      };
    } else {
      const records = await db
        .select()
        .from(gitUserCache)
        .where(
          and(
            eq(gitUserCache.targetUser, target),
            gte(gitUserCache.createdAt, freshThrreshold),
          ),
        );

      return records[0]?.userInfo;
    }
  } catch (err) {
    console.error("Cache read failed:", err);
    return null;
  }
}

export async function fetchRepoData(repo: string, targetUser: string) {
  if (!repo || !targetUser) return;

  const cachedData = await getCachedData(repo, "repo");

  if (cachedData && Object.values(cachedData).every((v) => v !== undefined)) {
    console.log("cache found");
    return cachedData;
  }

  const gitHeaders = {
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
    "User-Agent": "Portfolio-App",
  };
  try {
    const [repoDataRes, prDataRes, commitDataRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}`),
      fetch(
        `https://api.github.com/search/issues?q=type:pr+author:${targetUser}+repo:${repo}`,
        {
          headers: gitHeaders,
        },
      ),
      fetch(
        `https://api.github.com/search/commits?q=author:${targetUser}+repo:${repo}`,
        {
          headers: {
            ...gitHeaders,
            Accept: "application/vnd.github.cloak-preview+json",
          },
        },
      ),
    ]);

    if (!repoDataRes.ok || !prDataRes.ok || !commitDataRes.ok)
      throw new Error("Failed to establish connectiong with git.");

    const [repoData, prData, commitData] = await Promise.all([
      repoDataRes.json(),
      prDataRes.json(),
      commitDataRes.json(),
    ]);

    const contributionData = { prData: prData, commitData: commitData };
    const data = { repoData: repoData, contributionData: contributionData };
    await CacheContributionData(repo, data, "repo");
    return data;
  } catch (err) {
    throw new Error("Failed to establish connectiong with git.");
  }
}
