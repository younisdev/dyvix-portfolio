import { DyvixButton, DyvixInput, DyvixLabel } from "dyvix-ui";
import definition from "../../../../../registery/admin/definitions.json";
import React from "react";
import { index } from "drizzle-orm/gel-core";

type DyvixInputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "datetime-local";

export default function CompileDefinitions() {
  const [result, SetResult] = React.useState<Record<string, any>>({});

  console.log(result);
  return (
    <div
      style={{ padding: "20px", color: "#f8fafc", fontFamily: "sans-serif" }}
    >
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.7rem",
            color: "#00f2fe",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          Preset Editor
        </h2>
      </div>

      {Object.entries(definition).map(([key, val]) => {
        if (typeof val === "string") {
          return (
            <RenderStringInput
              key={key}
              fieldKey={key}
              val={val}
              tree={key}
              callback={SetResult}
            />
          );
        } else if (typeof val === "object" && val !== null) {
          return (
            <RenderDefinitionValue
              key={key}
              val={val}
              parentKey={key}
              tree={key}
              callback={SetResult}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

function RenderDefinitionValue({
  val,
  parentKey,
  layer = 0,
  tree,
  callback,
}: {
  val: any;
  parentKey: string;
  layer?: number;
  tree: string;
  callback: (prev: any) => void;
}) {
  return (
    <div
      style={{
        marginLeft: layer > 0 ? "14px" : "0px",
        borderLeft: layer > 0 ? "1px solid rgba(0, 242, 254, 0.2)" : "none",
        paddingLeft: layer > 0 ? "14px" : "0px",
        marginTop: "16px",
        marginBottom: "16px",
      }}
    >
      <h3
        style={{
          fontSize: `${Math.max(0.85, 1.3 - layer * 0.15)}rem`,
          color: layer === 0 ? "#00f2fe" : "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "12px",
          fontWeight: 600,
        }}
      >
        {parentKey}
      </h3>
      <div>
        {Object.entries(val).map(([key, subVal]) => {
          if (typeof subVal === "string") {
            return (
              <RenderStringInput
                key={key}
                fieldKey={key}
                val={subVal}
                callback={callback}
                tree={`${tree}-${key}`}
              />
            );
          } else if (typeof subVal === "object" && subVal !== null) {
            return (
              <RenderDefinitionValue
                key={key}
                val={subVal}
                layer={layer + 1}
                parentKey={key}
                tree={`${tree}-${key}`}
                callback={callback}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function RenderStringInput({
  fieldKey,
  val,
  tree,
  callback,
}: {
  fieldKey: string;
  val: string;
  tree: string;
  callback: (prev: any) => void;
}) {
  const defaultVals = React.useRef({
    color: "#0b0f17",
    string: "",
    number: 0,
    theme: "singularity",
  });

  React.useEffect(() => {
    if (val.includes("Array")) {
      callback((prev: any) => setValFromTree(prev, tree, []));
    } else if (val.includes("color")) {
      callback((prev: any) =>
        setValFromTree(prev, tree, defaultVals.current["color"]),
      );
    } else if (val.includes("theme")) {
      callback((prev: any) =>
        setValFromTree(prev, tree, defaultVals.current["theme"]),
      );
    } else if (val.includes("number")) {
      callback((prev: any) =>
        setValFromTree(prev, tree, defaultVals.current["number"]),
      );
    } else {
      callback((prev: any) =>
        setValFromTree(prev, tree, defaultVals.current["string"]),
      );
    }
  }, []);

  if (val.includes("Array")) {
    const match = val.match(/Array<\{?(.*?)\}?>/);
    const innerShape = match ? match[1].trim() : val;

    return (
      <div
        style={{
          margin: "14px 0",
          padding: "12px",
          background: "rgba(99, 102, 241, 0.03)",
          border: "1px dashed rgba(99, 102, 241, 0.3)",
          borderRadius: "8px",
        }}
      >
        <DyvixLabel animation={null}>
          <span
            style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: 500 }}
          >
            {fieldKey}{" "}
            <span style={{ color: "#818cf8", fontSize: "0.75rem" }}>
              (List of Objects)
            </span>
          </span>
        </DyvixLabel>
        <div
          style={{
            fontSize: "0.75rem",
            color: "#64748b",
            fontFamily: "monospace",
            marginTop: "4px",
            marginBottom: "8px",
          }}
        >
          Shape: {innerShape}
        </div>
        <DyvixButton
          style={{
            background: "rgba(99, 102, 241, 0.15)",
            color: "#a5b4fc",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "4px 10px",
            borderRadius: "4px",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          + Add {fieldKey} Item
        </DyvixButton>
      </div>
    );
  }
  if (val.includes("color")) {
    return (
      <div style={{ margin: "12px 0" }}>
        <div style={{ marginBottom: "4px" }}>
          <DyvixLabel animation={null}>
            <span
              style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: 500 }}
            >
              {fieldKey}
            </span>
          </DyvixLabel>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 10px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "6px",
            width: "fit-content",
          }}
        >
          <input
            onChange={(e) =>
              callback((prev: any) =>
                setValFromTree(prev, tree, e.target.value),
              )
            }
            type="color"
            defaultValue={defaultVals.current["color"]}
            style={{
              width: "28px",
              height: "28px",
              border: "none",
              background: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          />
          <span
            style={{
              fontSize: "0.8rem",
              color: "#94a3b8",
              fontFamily: "monospace",
            }}
          >
            Select Color
          </span>
        </div>
      </div>
    );
  }

  if (val.includes("theme")) {
    return (
      <div style={{ margin: "12px 0" }}>
        <div style={{ marginBottom: "4px" }}>
          <DyvixLabel animation={null}>
            <span
              style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: 500 }}
            >
              {fieldKey}
            </span>
          </DyvixLabel>
        </div>
        <select
          onChange={(e) =>
            callback((prev: any) => setValFromTree(prev, tree, e.target.value))
          }
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            color: "#f8fafc",
            fontSize: "0.9rem",
            outline: "none",
          }}
          defaultValue={defaultVals.current["theme"]}
        >
          <option value="singularity">singularity</option>
          <option value="cyberpunk">cyberpunk</option>
          <option value="minimal">minimal</option>
        </select>
      </div>
    );
  }

  let type: DyvixInputType = "text";
  if (val.includes("number")) type = "number";

  return (
    <div style={{ margin: "12px 0" }}>
      <div style={{ marginBottom: "4px" }}>
        <DyvixLabel animation={null}>
          <span
            style={{ fontSize: "0.85rem", color: "#cbd5e1", fontWeight: 500 }}
          >
            {fieldKey}
          </span>
        </DyvixLabel>
      </div>
      <DyvixInput
        onChange={(e) =>
          callback((prev: any) => setValFromTree(prev, tree, e.target.value))
        }
        type={type}
        placeholder={fieldKey}
        animation={null}
      />
    </div>
  );
}

function setValFromTree(
  obj: Record<string, any>,
  tree: string,
  value: any,
): Record<string, any> {
  const splitTree = tree.split("-").filter(Boolean);
  const assignRecursively = (
    current: Record<string, any>,
    index: number,
  ): Record<string, any> => {
    const key = splitTree[index];

    if (index === splitTree.length - 1) {
      return { ...(current || {}), [key]: value };
    }

    return {
      ...(current || {}),
      [key]: assignRecursively(current ? current[key] : undefined, index + 1),
    };
  };
  return assignRecursively(obj, 0);
}
