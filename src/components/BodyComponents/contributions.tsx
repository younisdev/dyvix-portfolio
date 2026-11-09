"use client";

import Image from "next/image";
import StackIcons from "../StackIcons";
import { fetchRepoData } from "@/service";
import React from "react";
import contributionThemes from "../../../registery/contribution/theme.json";
import { parseThemePropertyconfig } from "@/app/utils";

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

  const contributionThemesThemeProperties = contributionThemes.find(
    (ele) => ele.theme === theme,
  )?.properties;
  const contributionThemesOverrides = parseThemePropertyconfig(
    contributionThemesThemeProperties as Record<string, any>,
    "contribution",
  );
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
      style={{ color: foregroundColor, ...contributionThemesOverrides }}
    >
      <h2 className="flex flex-wrap w-[90%] scroll-id-pointer" id={data.id}>
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
              className="contribution-item flex flex-col gap-2 w-[90%] rounded-xl border border-white/10 bg-white/[0.02] p-5 align-middle"
            >
              <h3 className="contribution-identifier flex flex-row gap-2 items-center text-lg font-bold">
                <Image
                  src={repoDetails?.owner.avatar_url}
                  alt={`${repoDetails?.name} repo avatar`}
                  width={5}
                  height={5}
                  className="w-6 h-6 object-cover"
                />
                <a
                  className="contribution-name font-bold hover:underline"
                  href={`https://github.com/${entry.repo}/pulls?q=is%3Apr+author%3A${data.targetUser}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {repoDetails?.name || splitRepoIdentifier[1]}
                </a>

                {repoDetails?.language && (
                  <StackIcons name={repoDetails.language} />
                )}
              </h3>
              <span className="contribution-path text-xs font-mono opacity-50">
                {entry.repo}
              </span>
              <span className="contribution-role text-xs font-medium uppercase mt-2">
                {entry.role}
              </span>

              {repoDetails?.description && (
                <p className="contribution-description text-sm opacity-80 mt-2">
                  {repoDetails.description}
                </p>
              )}

              <div className="contribution-stats flex items-center gap-4 text-xs mt-2">
                <span className="capitalize font-extrabold opacity-95">
                  Repository Stats
                </span>
                <span className="contribution-stat-item opacity-80">
                  ⭐ {repoDetails.stargazers_count ?? 0} stars
                </span>
                <span className="contribution-stat-item opacity-80">
                  🍴 {repoDetails.forks_count ?? 0} forks
                </span>
              </div>

              <div className="contribution-stats flex items-center gap-4 text-xs mt-2">
                <span className="capitalize font-extrabold opacity-95">
                  User Contribution
                </span>
                <span className="contribution-stat-item opacity-80">
                  🔀 {contributionDetails?.prData?.total_count ?? 0} PRs
                </span>
                <span className="contribution-stat-item opacity-80">
                  💻 {contributionDetails?.commitData?.total_count ?? 0} commits
                </span>
              </div>
              {repoDetails?.topics.length > 0 && (
                <div className="contribution-tags flex flex-wrap flex-row items-center gap-4 text-xs mt-2">
                  <span className="capitalize font-extrabold opacity-95">
                    Tags
                  </span>
                  {repoDetails?.topics?.map((topic: string, index: number) => (
                    <span
                      className="contribution-tag-item p-2.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium select-none"
                      key={`contrib-tag-${index}`}
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })
      )}
    </section>
  );
}
