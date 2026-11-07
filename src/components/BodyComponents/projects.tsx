import projectThemes from "../../../registery/project/theme.json";
import { parseThemePropertyconfig } from "@/app/utils";
import Image from "next/image";
import StackIcons from "../StackIcons";

interface ContentProp {
  name: string;
  role: string;
  description?: string;
  points: string[];
  stack: string[];
  links: {
    link: string;
    icon: string;
  }[];
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
        <article key={`proj-${index}`} className="w-[90%] p-4">
          <div className="project-item flex flex-col md:flex-row gap-6 p-6 items-center  transition-all duration-300 hover:border-white/20 hover:-translate-y-1">
            {entry?.img && (
              <div className="relative w-full md:w-[38%] md:min-w-[38%] aspect-video md:aspect-[4/3.5] overflow-hidden rounded-xl bg-black/20">
                <Image
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  src={entry.img}
                  alt={`${entry.name} project logo`}
                  fill
                  sizes="(max-width: 768px) 90vw, 30vw"
                />
              </div>
            )}
            <div className="project-info flex flex-col gap-4">
              <div className="flex flex-col gap-1 align-item">
                <h3 className="project-name">{entry?.name}</h3>
                <span className="project-role">{entry?.role}</span>
              </div>
              <p className="project-description">{entry?.description}</p>
              <ul className="project-points flex flex-col gap-2 p-6">
                {entry?.points?.map((point, i) => (
                  <li key={`point-${i}`}>{point}</li>
                ))}
              </ul>
              <ul className="project-stacks flex flex-row gap-4 p-2 items-center">
                {entry?.stack?.map((item, i) => (
                  <li key={`stack-${i}`} className="select-none">
                    <StackIcons name={item} />
                  </li>
                ))}
              </ul>
              <div className="project-links flex flex-row gap-6 ml-auto items-center">
                {entry?.links?.map((item, i) => {
                  const label = item.icon.includes("/")
                    ? item.icon.split("/").pop()?.split(".")[0] || ""
                    : item.icon || "";
                  return (
                    <a
                      href={item.link}
                      target="_blank"
                      key={`stack-${i}`}
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-white/10 bg-white/5 text-xs font-medium transition-all hover:bg-white/10 hover:border-white/20 select-none active:scale-110"
                    >
                      {!item.icon.includes("/") ? (
                        <StackIcons name={item.icon} />
                      ) : (
                        <Image
                          className="w-6 h-6 object-contain"
                          src={item.icon || ""}
                          alt=""
                          width={24}
                          height={24}
                        />
                      )}
                      <span className="capitalize">{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
