"use client";

import { DyvixCommandMenu, DyvixNav } from "dyvix-ui";
// Use SJC later

import navThemes from "../../registery/nav/theme.json";
import { parseThemePropertyconfig } from "@/app/utils";
import React from "react";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

interface headerProps {
  config: Record<string, any>;
  tl?: gsap.core.Timeline | null;
}

export default function HeaderNav({ config, tl }: headerProps) {
  const navRef = React.useRef<HTMLDivElement>(null);
  const brandRef = React.useRef<HTMLDivElement>(null);
  const linksRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const theme = config?.["theme"] || "";
  const themeProperties = navThemes.find(
    (ele) => ele.theme === theme,
  )?.properties;
  const overrides = parseThemePropertyconfig(
    themeProperties as Record<string, any>,
    "nav",
  );

  const sections = config?.sections ?? [];
  const socialLinks = config?.links ?? [];
  const sectionOffset = sections.length;

  useGSAP(() => {
    if (!brandRef.current || !linksRef.current || !tl) return;
    const tempDuration = 1;
    const delay = tempDuration;

    tl.fromTo(
      brandRef.current,
      { y: -15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: delay },
    );
    tl.fromTo(
      linksRef.current,
      { y: -15, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: "power2.out",
      },
    );
  });

  React.useLayoutEffect(() => {
    const ele = navRef.current;
    if (!ele) return;

    const UpdateScrollMargin = () => {
      const computedStyle = window.getComputedStyle(ele);
      const marginTop = parseFloat(computedStyle.marginTop) || 0;
      const suggestedHeight = ele.offsetHeight + marginTop - 20;
      document.documentElement.style.setProperty(
        "--dyvix-scroll-margin-top",
        `${suggestedHeight}px`,
      );
    };

    const observe = new ResizeObserver(UpdateScrollMargin);
    observe.observe(ele);

    return () => {
      observe.disconnect();
      document.documentElement.style.removeProperty(
        "--dyvix-scroll-margin-top",
      );
    };
  }, []);

  return (
    <header className="w-full h-fit mt-3">
      <DyvixNav
        ref={navRef}
        overrides={{
          "--dyvix-nav-position": "fixed",
          "--dyvix-nav-margin": "1rem auto",
          ...overrides,
        }}
        style={{ top: "10px", left: "50%", transform: "translateX(-50%)" }}
        theme={null}
        animation={"drop"}
      >
        <DyvixNav.Brand ref={brandRef}>{config?.header}</DyvixNav.Brand>
        <div className="flex item-center justify-between w-full gap-4">
          {sections && (
            <DyvixNav.Menu>
              {sections.map((section: Record<string, any>, index: number) => (
                <DyvixNav.Link
                  key={`section-${section?.label}-${index}`}
                  ref={(ele) => {
                    if (ele) linksRef.current[index] = ele;
                  }}
                  href={section?.href || "#"}
                >
                  {section?.label}
                </DyvixNav.Link>
              ))}
            </DyvixNav.Menu>
          )}

          {socialLinks && (
            <DyvixNav.Menu>
              {socialLinks.map((link: Record<string, any>, index: number) => (
                <DyvixNav.Link
                  key={`social-${link?.label}-${index}`}
                  ref={(ele) => {
                    if (ele) linksRef.current[index + sectionOffset] = ele;
                  }}
                  href={link?.href || "#"}
                >
                  <Image
                    src={link?.icon}
                    alt={`${link?.label || "Social"} portfolio link`}
                    width={16}
                    height={16}
                    unoptimized
                    className="invert opacity-80 hover:opacity-100 transition-opacity"
                  />
                </DyvixNav.Link>
              ))}
            </DyvixNav.Menu>
          )}
        </div>
      </DyvixNav>
      <DyvixCommandMenu showOnRender={false} />
    </header>
  );
}
