"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import React from "react";

interface LoadingWrapperTypes {
  children: React.ReactNode;
  config: Record<string, any>;
}
interface ChildProps {
  tl?: gsap.core.Timeline | null;
}

export default function LoadingWrapper({
  children,
  config,
}: LoadingWrapperTypes) {
  const loadingDivRef = React.useRef<HTMLDivElement>(null);
  const [stage, setStage] = React.useState<"loading" | "In">("loading");
  const [result, setResult] = React.useState<string>("");

  const loadingConfig = config;
  const masterTlRef = React.useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (stage === "loading" && loadingConfig) {
        const targetText: string = loadingConfig?.text || "Loading...";

        const progressObj = { length: 0 };
        masterTlRef.current = gsap.timeline();
        const introTl = gsap.timeline({
          onComplete: () => {
            setStage("In");
          },
        });

        introTl.to(progressObj, {
          length: targetText.length,
          duration: targetText.length * 0.1,
          ease: "none",
          onUpdate: () => {
            const currentLength = Math.floor(progressObj.length);

            setResult(targetText.slice(0, currentLength));
          },
        });

        introTl.to(loadingDivRef.current, {
          opacity: 0,
          scale: 0.9,
          delay: 0.3,
          ease: "power2.inOut",
          duration: 0.2,
        });
      }
    },
    { scope: loadingDivRef, dependencies: [stage, config] },
  );

  const compiledChilds = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement<ChildProps>(child)) {
        return React.cloneElement(child, {
          tl: masterTlRef.current,
        });
      }
    });
  }, [children, stage]);

  return (
    <>
      {stage === "loading" ? (
        <div
          className="flex flex-wrap items-center justify-center w-screen min-h-screen"
          ref={loadingDivRef}
        >
          <p className="text-blue-500 font-mono text-3xl font-bold -tracking-tight select-none transition-all duration-300 hover:[text-shadow:0_0_32px_rgba(37,99,235,0.8)]">
            {result}
            <span className="animate-pulse text-blue-400 ml-0.5">|</span>
          </p>
        </div>
      ) : (
        compiledChilds || children
      )}
    </>
  );
}
