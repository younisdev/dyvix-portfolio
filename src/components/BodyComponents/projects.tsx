import projectThemes from "../../../registery/project/theme.json";
import { parseThemePropertyconfig } from "@/app/utils";
import Image from "next/image";

interface ContentProp {
  name: string;
  role: string;
  description?: string;
  points: string[];
  stack: string[];
  links: {
    link: string;
    icon: string;
    active?: boolean;
  };
  img: string;
}

interface ProjectsProps {
  data: {
    type: "hero";
    id?: string;
    foregroundColor?: string;
    content: ContentProp[];
  };
  globalForegroundColor?: string;
  theme?: string;
  tl?: gsap.core.Timeline | null;
}

export default function BodyProjectsSection({
  data,
  globalForegroundColor,
  theme,
  tl,
}: ProjectsProps) {
  const foregroundColor =
    data?.foregroundColor || globalForegroundColor || "#f8fafc";

  const projectThemesThemeProperties = projectThemes.find(
    (ele) => ele.theme === theme,
  )?.properties;
  const projectThemesOverrides = parseThemePropertyconfig(
    projectThemesThemeProperties as Record<string, any>,
    "project",
  );
  const content = data?.content;
  return (
    <section
      id="project-section"
      className="flex flex-wrap flex-col justify-center items-center gap-2 mt-32 w-full"
      style={{ color: foregroundColor, ...projectThemesOverrides }}
    >
      <h2 className="flex flex-wrap w-[90%] scroll-id-pointer" id="projects">
        <span className="section-header text-4xl font-bold">Projects</span>
      </h2>
      {content?.map((entry, index) => (
        <div key={`proj-${index}`} className="w-[90%] p-4">
          <div className="project-item flex flex-col md:flex-row gap-6 p-6 items-center">
            {entry?.img && (
              <div className="relative w-full h-64 md:w-64 md:min-w-64 shrink-0 overflow-hidden rounded-lg">
                <Image
                  className="object-contain"
                  src={entry.img}
                  alt={entry?.name || "Project preview"}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                />
              </div>
            )}
            <div className="project-info flex flex-col gap-4">
              <h3 className="project-name">{entry?.name}</h3>
              <p className="project-description">{entry?.description}</p>
              <ul className="project-points flex flex-col gap-2 p-6">
                {entry?.points?.map((point, i) => (
                  <li key={`point-${i}`}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
