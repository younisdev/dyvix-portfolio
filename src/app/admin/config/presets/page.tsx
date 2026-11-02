"use client";

import React from "react";
import AdminAuthShell from "../../../../components/admin/AdminAuthShell";
import {
  deletePreset,
  getPresetData,
  perfomSavePreset,
  performPresetActivation,
} from "@/service";
import { DyvixButton, DyvixLabel, dyvixToast } from "dyvix-ui";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import CompileDefinitions, {
  RenderStringInput,
} from "@/components/admin/config/preset/DefinitionCompiler";
import PlaygroundPreview from "@/components/admin/config/preset/PlaygroundPreview";

export interface Preset {
  id?: string;
  profileName: string;
  description: string | null;
  contentConfig: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function PresetPage() {
  const [mode, SetMode] = React.useState<"View" | "Create" | "Edit">("View");
  const [presets, setPresets] = React.useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = React.useState<Preset | null>(
    null,
  );
  const [result, SetResult] = React.useState<Record<string, any>>({});
  const [autoSave, setAutoSave] = React.useState(true);
  const [animIdentifier, setAnimIdentifier] = React.useState<{
    type: "normal" | "uni" | "section";
    id?: string;
    status: "leaving" | "entering";
  }>({ type: "section", status: "entering" });
  const [nextSection, setNextSection] = React.useState<
    "View" | "Create" | "Edit" | null
  >(null);
  const viewSectionRef = React.useRef<HTMLDivElement | null>(null);
  const editorSectionRef = React.useRef<HTMLDivElement | null>(null);
  const itemsRef = React.useRef<{ [key: string]: HTMLDivElement | null }>({});
  const snapshotPreset = (p: Preset | null) =>
    p ? JSON.stringify([p.profileName, p.description, p.contentConfig]) : "";
  const lastSavedRef = React.useRef("");
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  React.useEffect(() => {
    async function compilePresetData() {
      const result = await getPresetData();

      if (result.success) {
        setPresets(result.data as Preset[]);
      }
    }

    compilePresetData();
  }, [refreshTrigger]);

  React.useEffect(() => {
    if (!autoSave || mode !== "Edit" || !selectedPreset?.id) return;
    if (snapshotPreset(selectedPreset) === lastSavedRef.current) return;
    async function performAutoSave() {
      await SavePreset(true);
    }

    const timeoutId = setTimeout(() => {
      performAutoSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [selectedPreset, autoSave, mode]);

  console.log(selectedPreset);

  // Shared animations utilitiy allowing deep control for the developer (port to dyvix ui?)
  useGSAP(() => {
    const targetElement =
      animIdentifier.type !== "normal" && animIdentifier.id
        ? [itemsRef.current[animIdentifier.id]].filter(Boolean)
        : Object.values(itemsRef.current).filter(Boolean);
    const sectionRef = viewSectionRef.current
      ? viewSectionRef.current
      : editorSectionRef.current;
    if (animIdentifier.status === "entering") {
      const tl = gsap.timeline();

      if (animIdentifier.type === "section") {
        tl.to(sectionRef, {
          opacity: 1,
        });
      }
      if (targetElement.length > 0) {
        tl.set(targetElement, {
          scale: 0.9,
        });

        tl.to(targetElement, {
          opacity: 1,
          scale: 1,
          stagger: 0.15,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    } else if (
      animIdentifier.status === "leaving" &&
      animIdentifier.type === "section"
    ) {
      gsap.to(sectionRef, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          if (nextSection) {
            SetMode(nextSection);
            setNextSection(null);
          }

          setAnimIdentifier({ type: "section", status: "entering" });
        },
      });
    } else if (animIdentifier.id && animIdentifier.status === "leaving") {
      gsap.to(itemsRef.current[animIdentifier.id], {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () =>
          setPresets((prev) => prev.filter((p) => p.id !== animIdentifier.id)),
      });
    }
  }, [animIdentifier, presets]);
  async function SavePreset(silent = false) {
    let result;

    if (selectedPreset?.id && selectedPreset.profileName) {
      result = await perfomSavePreset(
        selectedPreset.profileName,
        selectedPreset.description || "",
        selectedPreset.contentConfig,
        selectedPreset?.id,
      );
    } else if (selectedPreset?.profileName) {
      result = await perfomSavePreset(
        selectedPreset.profileName,
        selectedPreset.description || "",
        selectedPreset.contentConfig,
        selectedPreset?.id,
      );
    }

    if (result?.success) {
      lastSavedRef.current = snapshotPreset(selectedPreset);
    }
    if (!silent)
      dyvixToast[result?.success ? "success" : "error"](
        !result?.success ? result?.data : "Preset Updated Succcesfully!",
      );
  }
  const ChangeMode = (targetMode: "View" | "Create" | "Edit") => {
    if (targetMode === mode) return;
    if (targetMode === "Create") {
      setSelectedPreset((prev) => (prev ? { ...prev, id: undefined } : null));
    }
    setNextSection(targetMode);
    setAnimIdentifier({ id: undefined, status: "leaving", type: "section" });
  };
  const handelPresetDeletion = async (presetId: string) => {
    const result = await deletePreset(presetId);
    const status = result.success ? "success" : "error";
    if (status === "success") {
      setAnimIdentifier({ id: presetId, status: "leaving", type: "uni" });
    }
    dyvixToast[status](result.data);
  };

  const ActivatePreset = async (presetId: string) => {
    const result = await performPresetActivation(presetId);
    const status = result.success ? "success" : "error";
    dyvixToast[status](
      !result?.success ? result?.data : "Preset Updated Succcesfully!",
    );
    setRefreshTrigger((prev) => prev + 1);
  };
  return (
    <AdminAuthShell>
      <h2 className="flex flex-wrap w-full text-blue-300 mt-10 ml-10">
        <span className="section-header text-3xl font-bold">
          Configuration Preset
        </span>
      </h2>
      <div className="flex flex-col gap-4 p-2">
        <div className="editor-toolbox">
          {mode !== "View" && (
            <DyvixButton
              overrides={{
                "--dyvix-button-bg":
                  "linear-gradient(135deg, rgba(0, 242, 254, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)",
                "--dyvix-button-border-color": "rgba(0, 242, 254, 0.3)",
                "--dyvix-button-color": "#f8fafc",
                "--dyvix-button-padding": "0.9rem",
                "--dyvix-button-border-radius": "6px",
              }}
              onClick={() => ChangeMode("View")}
            >
              Back
            </DyvixButton>
          )}
          {mode !== "Create" && (
            <DyvixButton
              overrides={{
                "--dyvix-button-bg":
                  "linear-gradient(135deg, rgba(0, 242, 254, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)",
                "--dyvix-button-border-color": "rgba(0, 242, 254, 0.3)",
                "--dyvix-button-color": "#f8fafc",
                "--dyvix-button-padding": "4px 8px",
                "--dyvix-button-border-radius": "6px",
              }}
              onClick={() => ChangeMode("Create")}
            >
              <span
                style={{
                  color: "#00f2fe",
                  fontWeight: 700,
                  fontSize: "1.7rem",
                  marginRight: "6px",
                }}
              >
                +
              </span>
              <span>New Preset</span>
            </DyvixButton>
          )}
          {(mode === "Create" || mode === "Edit") && (
            <>
              <DyvixButton
                onClick={() => SavePreset()}
                overrides={{
                  "--dyvix-button-bg":
                    "linear-gradient(135deg, rgba(0, 242, 254, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)",
                  "--dyvix-button-border-color": "rgba(0, 242, 254, 0.3)",
                  "--dyvix-button-color": "#f8fafc",
                  "--dyvix-button-padding": "4px 8px",
                  "--dyvix-button-border-radius": "6px",
                }}
              >
                <span
                  style={{
                    color: "#00f2fe",
                    fontWeight: 700,
                    fontSize: "1.7rem",
                    marginRight: "6px",
                  }}
                >
                  +
                </span>
                <span>Save</span>
              </DyvixButton>
            </>
          )}
          {mode === "Edit" && (
            <div className="flex items-center gap-2 text-xl font-extrabold text-slate-300">
              <input
                type="checkbox"
                id="auto-save"
                onChange={(e) => setAutoSave(e.target.checked)}
                checked={autoSave}
                className="w-4.5 h-4.5 accent-cyan-400 cursor-pointer"
              />
              <DyvixLabel htmlFor="auto-save" animation={null}>
                Auto Save
              </DyvixLabel>
            </div>
          )}
        </div>
        {mode === "View" && (
          <div ref={viewSectionRef} style={{ opacity: 0 }}>
            <div className="preset-container">
              {presets?.map((preset) => {
                return (
                  <div
                    style={{ opacity: 0 }}
                    key={preset.id}
                    className={`preset-item ${preset.isActive ? "active" : ""}`}
                    ref={(ele) => {
                      if (!preset.id) return;

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
                          (Updated at{" "}
                          {new Date(preset.updatedAt).toDateString()})
                        </span>
                      )}
                    </span>
                    <div className="preset-actions">
                      {!preset.isActive && (
                        <DyvixButton
                          onClick={() => {
                            if (!preset.id) return;
                            ActivatePreset(preset.id);
                          }}
                          overrides={{
                            "--dyvix-button-bg": "green",
                            "--dyvix-button-border-style": "none",
                          }}
                        >
                          Set Active
                        </DyvixButton>
                      )}
                      <DyvixButton
                        onClick={() => {
                          setSelectedPreset(preset);
                          ChangeMode("Edit");
                        }}
                        overrides={{
                          "--dyvix-button-bg": "blue",
                          "--dyvix-button-border-style": "none",
                        }}
                      >
                        Edit
                      </DyvixButton>
                      <DyvixButton
                        onClick={() => {
                          if (!preset.id) return;
                          handelPresetDeletion(preset.id);
                        }}
                        overrides={{
                          "--dyvix-button-bg": "rgba(239, 68, 68, 0.15)",
                          "--dyvix-button-border-style": "none",
                        }}
                      >
                        Delete
                      </DyvixButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(mode === "Create" || mode === "Edit") && (
          <div
            className="preset-editor-container"
            ref={editorSectionRef}
            style={{ opacity: 0 }}
          >
            <div className="preset-control-panel">
              <RenderStringInput
                fieldKey="profileName"
                tree="profileName"
                val="string"
                callback={setSelectedPreset}
                defaults={selectedPreset}
              />
              <RenderStringInput
                fieldKey="description"
                tree="description"
                val="string"
                callback={setSelectedPreset}
                defaults={selectedPreset}
              />

              <CompileDefinitions
                defaults={
                  mode === "Edit" ? selectedPreset?.contentConfig : null
                }
                onChange={(data: Record<string, any>) => {
                  SetResult(data);
                  setSelectedPreset((prev) =>
                    prev ? { ...prev, contentConfig: data } : null,
                  );
                }}
              />
            </div>
            <div className="preset-playground">
              <PlaygroundPreview config={result} />
            </div>
          </div>
        )}
      </div>
    </AdminAuthShell>
  );
}
