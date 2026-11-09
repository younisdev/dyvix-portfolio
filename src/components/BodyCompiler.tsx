"use client";

import { lazy, Suspense } from "react";

interface bodyProps {
  config: Record<string, any>;
  tl?: gsap.core.Timeline | null;
}

const COMPONENT_MAP: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  hero: lazy(() => import("./BodyComponents/hero")),
  projects: lazy(() => import("./BodyComponents/projects")),
  contributions: lazy(() => import("./BodyComponents/contributions")),
};

function getComponent(type: string) {
  return COMPONENT_MAP[type];
}

export default function BodyCompiler({ config, tl }: bodyProps) {
  const sectionConfig = config?.["sections"];
  const theme = config?.["theme"];
  return (
    <main>
      {Object.values(
        sectionConfig as Record<
          string,
          { type: string; id: string; [key: string]: any }
        >,
      )?.map((section) => {
        const SectionComponent = getComponent(section.type);
        if (!SectionComponent) {
          console.warn(`Component type "${section.type}" is not registered.`);
          return null;
        }

        return (
          <Suspense key={section.id} fallback={`Loading...`}>
            <SectionComponent data={section} theme={theme} tl={tl} />
          </Suspense>
        );
      })}
    </main>
  );
}
