"use client";

import Image from "next/image";
import StackIcons from "../StackIcons";
import { fetchRepoData } from "@/service";
import { useGSAP } from "@gsap/react";
import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  disableAnimation?: boolean;
}

type RepoEntry = Record<string, any>;
gsap.registerPlugin(ScrollTrigger);

export default function BodyContributionsSection({
  data,
  globalForegroundColor,
  theme,
  tl,
  disableAnimation = false,
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

  const [loading, setLoading] = React.useState(
    !disableAnimation ? true : false,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (loading || disableAnimation) return;
      const items = containerRef.current?.querySelectorAll(
        ".contribution-item-wrapper",
      );

      if (!items || items.length === 0) return;

      gsap.fromTo(
        items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          duration: 0.6,
          stagger: 0.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        },
      );
    },
    { scope: containerRef, dependencies: [loading] },
  );

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
      ref={containerRef}
      className="flex flex-wrap flex-col justify-center items-center gap-6 mt-32 w-full"
      style={{ color: foregroundColor, ...contributionThemesOverrides }}
    >
      <h2 className="flex flex-wrap w-[90%] scroll-id-pointer" id={data?.id}>
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
            ? matchedRepoObj[entry.repo]?.["repoData"]
            : null;

          const contributionDetails =
            matchedRepoObj?.[entry.repo]?.["contributionData"];

          const topics = Array.isArray(repoDetails?.topics)
            ? repoDetails.topics
            : [];

          return (
            <div
              key={`contribution-${index}`}
              style={
                disableAnimation ? { opacity: 1, transform: "none" } : undefined
              }
              className="contribution-item-wrapper w-full flex justify-center"
            >
              <article className="contribution-item flex flex-col gap-2 w-[90%] rounded-xl border border-white/10 bg-white/[0.02] p-5 align-middle">
                <h3 className="contribution-identifier flex flex-row gap-2 items-center text-lg font-bold">
                  {repoDetails?.owner?.avatar_url && (
                    <Image
                      src={repoDetails.owner.avatar_url}
                      alt={`${repoDetails?.name || "repo"} repo avatar`}
                      width={20}
                      height={20}
                      className="w-6 h-6 object-cover rounded-full"
                    />
                  )}
                  <a
                    className="contribution-name font-bold hover:underline"
                    href={`https://github.com/${entry.repo}/pulls?q=is%3Apr+author%3A${data?.targetUser}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repoDetails?.name || splitRepoIdentifier[1]}
                  </a>

                  {repoDetails?.language && (
                    <StackIcons name={repoDetails?.language} />
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
                    ⭐ {repoDetails?.stargazers_count ?? 0} stars
                  </span>
                  <span className="contribution-stat-item opacity-80">
                    🍴 {repoDetails?.forks_count ?? 0} forks
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
                    💻 {contributionDetails?.commitData?.total_count ?? 0}{" "}
                    commits
                  </span>
                </div>

                {topics.length > 0 && (
                  <div className="contribution-tags flex flex-wrap flex-row items-center gap-4 text-xs mt-2">
                    <span className="capitalize font-extrabold opacity-95">
                      Tags
                    </span>
                    {topics.map((topic: string, tagIndex: number) => (
                      <span
                        className="contribution-tag-item p-2.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium select-none"
                        key={`contrib-tag-${tagIndex}`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </div>
          );
        })
      )}
    </section>
  );
}
