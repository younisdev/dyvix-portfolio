"use client";

import Image from "next/image";
import StackIcons from "../StackIcons";
import { fetchRepoData } from "@/service";
import React from "react";
import { boolean } from "drizzle-orm/gel-core";

interface ContentProp {
  repo: string;
  role: string;
}

interface ContributionsProps {
  data: {
    type: "contributions";
    id?: string;
    foregroundColor?: string;
    targetUser: string;
    content: ContentProp[];
  };
  globalForegroundColor?: string;
  theme?: string;
  tl?: gsap.core.Timeline | null;
}

type RepoEntry = Record<string, any>;

export default function BodyContributionsSection({
  data,
  globalForegroundColor,
  theme,
  tl,
}: ContributionsProps) {
  const foregroundColor =
    data?.foregroundColor || globalForegroundColor || "#f8fafc";

  const content = data?.content;

  const [hydratedEntries, setHydratedEntries] = React.useState<{
    repos: RepoEntry[];
    user: Record<string, any>;
  }>({
    repos: [],
    user: {},
  });

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadHydrateEntries() {
      try {
        const HydratedRepoEntries: RepoEntry[] = await Promise.all(
          content.map(async (entry) => {
            const repoData = await fetchRepoData(entry.repo, data.targetUser);

            return { [entry.repo]: repoData };
          }),
        );

        setHydratedEntries({ repos: HydratedRepoEntries, user: {} });
      } catch (err) {
        console.error("Failed to load contribution data", err);
      } finally {
        setLoading(false);
      }
    }
    loadHydrateEntries();
  }, [data]);

  return (
    <section
      id="contribution-section"
      className="flex flex-wrap flex-col justify-center items-center gap-6 mt-32 w-full"
      style={{ color: foregroundColor }}
    >
      <h2 className="flex flex-wrap w-[90%] scroll-id-pointer" id="projects">
        <span className="section-header text-4xl font-bold">Contributions</span>
      </h2>

      {loading ? (
        <div className="text-center m-32">Loading contributions...</div>
      ) : (
        content?.map((entry, index) => {
          const splitRepoIdentifier = entry.repo.split("/");
          const matchedRepoObj = hydratedEntries.repos.find(
            (item) => item[entry.repo],
          );
          const repoDetails = matchedRepoObj
            ? matchedRepoObj[entry.repo]["repoData"]
            : null;

          const contributionDetails =
            matchedRepoObj?.[entry.repo]["contributionData"];

          return (
            <article
              key={`contribution-${index}`}
              className="contribution-item flex flex-col gap-2 w-[90%] rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex flex-col gap-1 align-middle">
                <h3 className="flex flex-row gap-2 items-center text-lg font-bold">
                  <a
                    className="font-bold hover:underline"
                    href={`https://github.com/${entry.repo}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repoDetails?.name || splitRepoIdentifier[1]}
                  </a>

                  {repoDetails?.language && (
                    <StackIcons name={repoDetails.language} />
                  )}
                </h3>
                <span className="text-xs font-mono opacity-50">
                  {entry.repo}
                </span>
                <span className="text-xs font-medium uppercase text-indigo-400">
                  {entry.role}
                </span>

                {repoDetails?.description && (
                  <p className="text-sm opacity-80 mt-2">
                    {repoDetails.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs opacity-60 mt-2">
                  <span className="capitalize font-extrabold opacity-95">
                    Repository Stats
                  </span>
                  <span>⭐ {repoDetails.stargazers_count ?? 0} stars</span>
                  <span>🍴 {repoDetails.forks_count ?? 0} forks</span>
                </div>

                <div className="flex items-center gap-4 text-xs opacity-60 mt-2">
                  <span className="capitalize font-extrabold opacity-95">
                    User Contribution
                  </span>
                  <span>
                    🔀 {contributionDetails?.prData?.total_count ?? 0} PRs
                  </span>
                  <span>
                    💻 {contributionDetails?.commitData?.total_count ?? 0}{" "}
                    commits
                  </span>
                </div>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
