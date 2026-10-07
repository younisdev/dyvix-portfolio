"use client";

import { DyvixButton } from "dyvix-ui";
import buttonThemes from "../../../registery/button/themes.json";
import maqueeThemes from "../../../registery/marquee/theme.json";
import { parseThemePropertyconfig } from "@/app/utils";
import Image from "next/image";
import { DyvixMarquee, DyvixMarqueeItem } from "dyvix-ui";
import React from "react";
import { useGSAP } from "@gsap/react";

interface ctaProps {
  id: string;
  label: string;
  href: string;
}

interface HeroProps {
  data: {
    bio?: string;
    type: "hero";
    id?: string;
    title?: string;
    cta?: ctaProps[];
    stack?: { content: string[]; type: "normal" | "marquee"; id?: string };
    foregroundColor?: string;
  };
  globalForegroundColor?: string;
  theme?: string;
  tl?: gsap.core.Timeline | null;
}

export default function BodyHeroSection({
  data,
  globalForegroundColor,
  theme,
  tl,
}: HeroProps) {
  const heroTextRef = React.useRef<HTMLElement[]>([]);
  const ctaBtnRef = React.useRef<HTMLElement[]>([]);
  const skillsContainerRef = React.useRef<HTMLDivElement | null>(null);

  const foregroundColor =
    data?.foregroundColor || globalForegroundColor || "#f8fafc";

  const buttonThemeProperties = buttonThemes.find(
    (ele) => ele.theme === theme,
  )?.properties;
  const buttonOverrides = parseThemePropertyconfig(
    buttonThemeProperties as Record<string, any>,
    "button",
  );

  const marqueeThemeProperties =
    (data?.stack?.content?.length ?? 0) > 0
      ? maqueeThemes.find((ele) => ele.theme === theme)?.properties
      : {};

  const marqueeOverrides = parseThemePropertyconfig(
    marqueeThemeProperties as Record<string, any>,
    "marquee",
  );

  useGSAP(
    () => {
      if (!tl) return;

      const validHeroText = heroTextRef.current.filter(Boolean);
      const validCtaBtns = ctaBtnRef.current.filter(Boolean);
      if (validHeroText.length > 0) {
        tl.fromTo(
          validHeroText,
          {
            y: -50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            ease: "power3.out",
            stagger: 0.08,
            duration: 0.2,
          },
        );
      }

      if (validCtaBtns.length > 0) {
        tl.fromTo(
          validCtaBtns,
          {
            x: 40,
            scale: 0.85,
            opacity: 0,
          },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            ease: "back.out(1.4)",
            stagger: 0.08,
            duration: 0.4,
          },
          "-=0.25",
        );
      }
      if (skillsContainerRef.current) {
        tl.fromTo(
          skillsContainerRef.current,
          {
            scaleX: 0,
            opacity: 0,
            transformOrigin: "left center",
          },
          {
            opacity: 1,
            scaleX: 1,
            ease: "power3.out",
            duration: 0.5,
          },
          "-=0.2",
        );
      }
    },
    { dependencies: [tl] },
  );

  return (
    <section
      id="hero-section"
      className="flex flex-wrap flex-col justify-center items-center gap-17 mt-50"
      style={{ color: foregroundColor }}
    >
      {data?.title && (
        <h1
          style={{ opacity: 0 }}
          ref={(ele) => {
            if (ele && !heroTextRef.current.includes(ele)) {
              heroTextRef.current.push(ele);
            }
          }}
          className="font-bold text-4xl md:text-6xl select-none transition-all duration-300 hover:[text-shadow:0_0_32px_rgba(37,99,235,0.8)]"
        >
          {data.title}
        </h1>
      )}
      {data?.bio && (
        <p
          style={{ opacity: 0 }}
          ref={(ele) => {
            if (ele && !heroTextRef.current.includes(ele)) {
              heroTextRef.current.push(ele);
            }
          }}
          className="font-thin text-base select-none transition-all duration-200 hover:[text-shadow:0_0_22px_rgba(37,99,235,0.8)]"
        >
          {data.bio}
        </p>
      )}

      {data?.cta && data.cta.length > 0 && (
        <div className="flex flex-row gap-5">
          {data.cta.map((button: ctaProps, index) => (
            <a
              style={{ opacity: 0 }}
              ref={(ele) => {
                if (ele && !heroTextRef.current.includes(ele)) {
                  ctaBtnRef.current.push(ele);
                }
              }}
              href={button.href}
              id={button.id}
              aria-label={`${button.label} link.`}
              key={`cta-button-${index}`}
            >
              <DyvixButton overrides={buttonOverrides}>
                {button.label}
              </DyvixButton>
            </a>
          ))}
        </div>
      )}

      {data?.stack?.content &&
        data.stack?.content.length > 0 &&
        (() => {
          const type = data?.stack?.type || "normal";
          const ElemntType = type === "normal" ? `div` : DyvixMarquee;
          const elementProps = {
            ...(type === "normal" && { className: "flex flex-row gap-3" }),
            ...(type === "marquee" && {
              speed: 1,
              repeat: -1,
              overrides: marqueeOverrides,
              pauseOnHover: true,
            }),
            style: { marginTop: "6rem", opacity: 0 },
          };
          return (
            <ElemntType
              {...elementProps}
              id={data?.stack?.id}
              ref={skillsContainerRef}
            >
              {data.stack?.content.map(
                (
                  skill:
                    string | { text?: string; icon?: string; href?: string },
                  index,
                ) => {
                  const isString = typeof skill === "string";
                  const Element =
                    type === "marquee"
                      ? DyvixMarqueeItem
                      : isString || !skill?.href
                        ? "span"
                        : "a";
                  const props = {
                    ...(type !== "marquee" && {
                      className:
                        "border-b-blue-300 border-2 rounded-3xl bg-purple-400 hover:bg-amber-50 hover:border-white hover:text-gray-950 hover:cursor-pointer p-2 justify-center",
                    }),
                    ...(Element !== "span" &&
                      !isString && { href: skill?.href }),
                  };
                  return (
                    <Element key={`cta-skill-${index}`} {...props}>
                      {isString ? (
                        skill
                      ) : skill.icon ? (
                        <div className="flex flex-row gap-2 align-middle items-center">
                          <Image
                            width={20}
                            height={20}
                            src={skill.icon}
                            alt={`${skill.text || `skill ${index}`} skill link.`}
                          />
                          <span>{skill.text}</span>
                        </div>
                      ) : (
                        skill.text
                      )}
                    </Element>
                  );
                },
              )}
            </ElemntType>
          );
        })()}
    </section>
  );
}
