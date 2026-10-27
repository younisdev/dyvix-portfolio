"use client";

import React from "react";
import AdminAuthShell from "../../../../components/admin/AdminAuthShell";
import { deletePreset, getPresetData } from "@/service";
import { DyvixButton, dyvixToast } from "dyvix-ui";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CompileDefinitions from "@/components/admin/config/preset/DefinitionCompiler";

export interface Preset {
  id: string;
  profileName: string;
  description: string | null;
  contentConfig: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function PresetPage() {
  const [mode, SetMod] = React.useState<"View" | "Create" | "Edit">("Create");
  const [presets, SetPresets] = React.useState<Preset[]>([]);
  const [reload, setReload] = React.useState<boolean | null>(null);
  const [activeConfig, SetActiveConfig] = React.useState<any>(null);

  const [animIdentifier, setAnimIdentifier] = React.useState<{
    type: "normal" | "uni";
    id?: string;
    status: "leaving" | "entering";
  }>({ type: "normal", status: "entering" });
  const itemsRef = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  React.useEffect(() => {
    async function compilePresetData() {
      const result = await getPresetData();

      if (result.success) {
        SetPresets(result.data as Preset[]);
      }
    }

    compilePresetData();
  }, []);

  // Shared animations utilitiy allowing deep control for the developer (port to dyvix ui?)
  useGSAP(() => {
    const targetElement =
      animIdentifier.type !== "normal" && animIdentifier.id
        ? [itemsRef.current[animIdentifier.id]].filter(Boolean)
        : Object.values(itemsRef.current).filter(Boolean);

    if (animIdentifier.status === "entering" && targetElement.length > 0) {
      gsap.set(targetElement, {
        scale: 0.9,
      });

      gsap.to(targetElement, {
        opacity: 1,
        scale: 1,
        stagger: 0.15,
        duration: 0.6,
        ease: "power2.out",
      });
    } else if (
      animIdentifier.status === "leaving" &&
      targetElement.length > 0
    ) {
      gsap.to(targetElement, {
        scale: 0.9,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          if (animIdentifier.id) {
            SetPresets((prev) =>
              prev.filter((p) => p.id !== animIdentifier.id),
            );
          }
        },
      });
    }
  }, [animIdentifier, presets]);
  const handelPresetDeletion = async (presetId: string) => {
    const result = await deletePreset(presetId);
    const status = result.success ? "success" : "error";

    setAnimIdentifier({ id: presetId, status: "leaving", type: "uni" });
    dyvixToast[status](result.data);
  };

  return (
    <AdminAuthShell>
      <h2 className="flex flex-wrap w-full text-blue-300 mt-10 ml-10">
        <span className="section-header text-3xl font-bold">
          Configuration Preset
        </span>
      </h2>
      {mode === "View" && (
        <div>
          <div className="preset-container">
            {presets?.map((preset) => {
              return (
                <div
                  style={{ opacity: 0 }}
                  key={preset.id}
                  className={`preset-item ${preset.isActive ? "active" : ""}`}
                  ref={(ele) => {
                    if (ele) {
                      itemsRef.current[preset.id] = ele;
                    } else {
                      delete itemsRef.current[preset.id];
                    }
                  }}
                >
                  {preset.isActive && (
                    <span className="preset-active">Active</span>
                  )}
                  <span className="preset-header">{preset.profileName}</span>
                  <span className="preset-description">
                    {preset.description}
                  </span>
                  <span className="preset-date">
                    <span>{new Date(preset.createdAt).toDateString()}</span>
                    {new Date(preset.createdAt).getTime() !==
                      new Date(preset.updatedAt).getTime() && (
                      <span>
                        (Updated at {new Date(preset.updatedAt).toDateString()})
                      </span>
                    )}
                  </span>
                  <div className="preset-actions">
                    <DyvixButton
                      onClick={() => handelPresetDeletion(preset.id)}
                      overrides={{
                        "--dyvix-button-bg": "rgba(239, 68, 68, 0.15)",
                        "--dyvix-button-border-style": "none",
                      }}
                    >
                      Delete
                    </DyvixButton>
                    <DyvixButton
                      overrides={{
                        "--dyvix-button-bg": "blue",
                        "--dyvix-button-border-style": "none",
                      }}
                    >
                      Edit
                    </DyvixButton>
                    {!preset.isActive && (
                      <DyvixButton
                        overrides={{
                          "--dyvix-button-bg": "green",
                          "--dyvix-button-border-style": "none",
                        }}
                      >
                        Set Active
                      </DyvixButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === "Create" && (
        <div className="preset-editor-container">
          <div className="preset-control-panel">
            <CompileDefinitions/>
          </div>
          <div className="preset-playground"></div>
        </div>
      )}
    </AdminAuthShell>
  );
}
