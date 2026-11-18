"use server";

import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "./db";
import {
  configProfiles,
  gitUserCache,
  reposInformationCache,
  users,
} from "./db/schema";
import { getAuthenticatedUser } from "./auth/actions";
import { RequireOwner } from "./auth/guard";

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
    await RequireOwner();
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
    await RequireOwner();
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
    await RequireOwner();
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
    await RequireOwner();
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
  target: { repo: string; user: string },
  data: Record<string, any>,
  type: "repo" | "user",
) {
  try {
    const now = new Date();
    if (type === "repo") {
      await db
        .insert(reposInformationCache)
        .values({
          githubUser: target.user,
          repo: target.repo,
          repoInfo: data["repoData"],
          userContribution: data["contributionData"],
        })
        .onConflictDoUpdate({
          target: [
            reposInformationCache.repo,
            reposInformationCache.githubUser,
          ],
          set: {
            githubUser: target.user,
            repo: target.repo,
            repoInfo: data["repoData"],
            userContribution: data["contributionData"],
            createdAt: now,
          },
        });
    } else {
      await db
        .insert(gitUserCache)
        .values({ targetUser: target.user, userInfo: data })
        .onConflictDoUpdate({
          target: gitUserCache.targetUser,
          set: { userInfo: data, createdAt: now },
        });
    }
  } catch (err) {
    throw new Error("Failed to cache contributions data");
  }
}

async function getCachedData(
  target: { repo: string; user: string },
  type: "repo" | "user",
) {
  try {
    const CACHE_TTL_MS = dataExpiresIn * 24 * 60 * 60 * 1000;
    const freshThrreshold = new Date(Date.now() - CACHE_TTL_MS);

    if (type === "repo") {
      const records = await db
        .select()
        .from(reposInformationCache)
        .where(
          and(
            eq(reposInformationCache.repo, target.repo),
            gte(reposInformationCache.createdAt, freshThrreshold),
            eq(reposInformationCache.githubUser, target.user),
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
            eq(gitUserCache.targetUser, target.user),
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

  const cachedData = await getCachedData(
    { repo: repo, user: targetUser },
    "repo",
  );

  if (cachedData && Object.values(cachedData).every((v) => v !== undefined)) {
    console.log("cache found");
    return cachedData;
  }

  const token = process.env.GITHUB_TOKEN;

  const gitHeaders = {
    "X-GitHub-Api-Version": "2022-11-28",
    Accept: "application/vnd.github+json",
    "User-Agent": "Portfolio-App",
    ...(token ? {Authorization: `Bearer ${token}`}: {})
  };
  try {
    const [repoDataRes, prDataRes, commitDataRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}`, {
        headers: gitHeaders
      }),
      fetch(
        `https://api.github.com/search/issues?q=type:pr+author:${targetUser}+repo:${repo}`,
        {
          headers: gitHeaders
        },
      ),
      fetch(
        `https://api.github.com/search/commits?q=author:${targetUser}+repo:${repo}`,
        {
          headers: {
            ...gitHeaders,
            Accept: "application/vnd.github.cloak-preview+json"
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
    await CacheContributionData({ repo: repo, user: targetUser }, data, "repo");
    return data;
  } catch (err) {
    console.log(err)
    throw new Error("Failed to establish connectiong with git.");
  }
}

export async function GetPresetsCount() {
  try {
    const result = await db.select().from(configProfiles);

    return { success: true, data: result.length };
  } catch (err) {
    console.error("Error finding presets data count", err);
    return { success: false, data: "Failed to get presets count" };
  }
}
export async function GetUsersCount() {
  try {
    const result = await db.select().from(users);

    return { success: true, data: result.length };
  } catch (err) {
    console.error("Error finding users count", err);
    return { success: false, data: "Failed to get users count" };
  }
}

export async function GetRepoCachCount() {
  try {
    const result = await db.select().from(reposInformationCache);

    return { success: true, data: result.length };
  } catch (err) {
    console.error("Error finding cached repos count", err);
    return { success: false, data: "Failed to get cached repos count" };
  }
}
