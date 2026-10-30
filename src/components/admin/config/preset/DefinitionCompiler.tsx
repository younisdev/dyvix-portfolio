import { DyvixButton, DyvixInput, DyvixLabel } from "dyvix-ui";
import definition from "../../../../../registery/admin/definitions.json";
import React from "react";

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

type FieldKind = "array" | "color" | "theme" | "number" | "string";

type ShapeVariant =
  | { kind: "object"; fields: Record<string, string> }
  | { kind: "primitive"; type: string };

const DEFAULT_VALS = {
  color: "#0b0f17",
  string: "",
  number: 0,
  theme: "singularity",
};

const THEME_OPTIONS = ["singularity", "cyberpunk", "minimal"];

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  background: "rgba(15, 23, 42, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "6px",
  color: "#f8fafc",
  fontSize: "0.9rem",
  outline: "none",
};

const smallButtonStyle: React.CSSProperties = {
  background: "rgba(99, 102, 241, 0.15)",
  color: "#a5b4fc",
  border: "1px solid rgba(99, 102, 241, 0.3)",
  borderRadius: "4px",
  padding: "2px 8px",
  fontSize: "0.8rem",
  cursor: "pointer",
};

function splitStringIntoItems(str: string, delimiters = ","): string[] {
  const splitItems: string[] = [];
  let depthBraces = 0;
  let depthBrackets = 0;
  let depthAngles = 0;
  let inQuotes = false;
  let quoteChar = "";
  let current = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if ((char === '"' || char === "'") && str[i - 1] !== "\\") {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        inQuotes = false;
        quoteChar = "";
      }
    }

    if (!inQuotes) {
      if (char === "{") depthBraces++;
      if (char === "}") depthBraces--;
      if (char === "[") depthBrackets++;
      if (char === "]") depthBrackets--;
      if (char === "<") depthAngles++;
      if (char === ">") depthAngles--;

      if (
        delimiters.includes(char) &&
        depthBraces === 0 &&
        depthBrackets === 0 &&
        depthAngles === 0
      ) {
        splitItems.push(current.trim());
        current = "";
        continue;
      }
    }
    current += char;
  }

  if (current.trim()) splitItems.push(current.trim());

  return splitItems;
}

function transformToObj(str: string): Record<string, string> {
  const result = str.slice(1, str.length - 1).trim();
  const fields: Record<string, string> = {};

  splitStringIntoItems(result, ",;").forEach((item) => {
    const colonIndex = item.indexOf(":");
    if (colonIndex === -1) return;

    const key = item
      .slice(0, colonIndex)
      .trim()
      .replace(/\?$/, "")
      .replace(/^["']|["']$/g, "");
    const value = item.slice(colonIndex + 1).trim();

    fields[key] = value;
  });

  return fields;
}

function hasTopLevelUnion(str: string): boolean {
  let braceDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === "{") braceDepth++;
    else if (char === "}") braceDepth--;
    else if (char === "|" && braceDepth === 0) {
      return true;
    }
  }
  return false;
}

function getInnerShape(typeString: string): string {
  const t = typeString.trim();
  return t.startsWith("Array<") && t.endsWith(">")
    ? t.slice(6, t.length - 1).trim()
    : "";
}

function parseVariants(innerShape: string): ShapeVariant[] {
  return splitStringIntoItems(innerShape, "|")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v): ShapeVariant => {
      if (v.startsWith("{") && v.endsWith("}")) {
        return { kind: "object", fields: transformToObj(v) };
      }
      return { kind: "primitive", type: v };
    });
}

function parseLiteralUnion(typeString: string): string[] | null {
  const parts = splitStringIntoItems(typeString, "|")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return null;

  const options: string[] = [];
  for (const part of parts) {
    const match = part.match(/^(["'`])(.*)\1$/);
    if (!match) return null;
    options.push(match[2]);
  }
  return options;
}

function getFieldKind(typeString: string): FieldKind {
  if (typeString.includes("Array")) return "array";
  if (typeString.includes("color")) return "color";
  if (typeString.includes("theme")) return "theme";
  if (typeString.includes("number")) return "number";
  return "string";
}

function createDefaultFor(typeString: string): any {
  const literals = parseLiteralUnion(typeString);
  if (literals) return literals[0];

  const kind = getFieldKind(typeString);
  return kind === "array" ? [] : DEFAULT_VALS[kind];
}

function createItem(variant: ShapeVariant): any {
  if (variant.kind === "primitive") return createDefaultFor(variant.type);

  return Object.fromEntries(
    Object.entries(variant.fields).map(([key, type]) => [
      key,
      createDefaultFor(type),
    ]),
  );
}

function matchVariant(item: any, variants: ShapeVariant[]): number {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const keys = Object.keys(item);
    let best = 0;
    let bestScore = -Infinity;

    variants.forEach((variant, i) => {
      if (variant.kind !== "object") return;
      const fieldKeys = Object.keys(variant.fields);
      const overlap = keys.filter((k) => fieldKeys.includes(k)).length;
      const score = overlap - 0.01 * fieldKeys.length;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    return best;
  }

  const primitive = variants.findIndex((v) => v.kind === "primitive");
  return primitive === -1 ? 0 : primitive;
}

function variantLabel(variant: ShapeVariant, index: number): string {
  if (variant.kind === "primitive") return variant.type;

  for (const type of Object.values(variant.fields)) {
    const literals = parseLiteralUnion(type);
    if (literals?.length === 1) return literals[0];
  }

  const keys = Object.keys(variant.fields);
  return keys.length ? keys.join(", ") : `Variant ${index + 1}`;
}

export default function CompileDefinitions({
  defaults,
  onChange,
}: {
  defaults?: Record<string, any> | null;
  onChange: Function;
}) {
  const [result, SetResult] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    onChange(result);
  }, [result]);

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
              defaults={defaults}
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
              defaults={defaults}
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
  defaults,
}: {
  val: any;
  parentKey: string;
  layer?: number;
  tree: string;
  callback: (prev: any) => void;
  defaults?: Record<string, any> | null;
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
                defaults={defaults}
              />
            );
          } else if (typeof subVal === "object" && subVal !== null) {
            return (
              <RenderDefinitionValue
                defaults={defaults}
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

export function RenderStringInput({
  fieldKey,
  val,
  tree,
  callback,
  defaults,
}: {
  fieldKey: string;
  val: string;
  tree: string;
  callback: (prev: any) => void;
  defaults?: Record<string, any> | null;
}) {
  const defaultVals = React.useRef(DEFAULT_VALS);

  const resolvedValue = React.useMemo(() => {
    const existingVal = getValFromTree(defaults || null, tree);
    if (existingVal !== null && existingVal !== undefined) {
      return existingVal;
    }

    if (val.includes("Array")) {
      return [];
    } else if (val.includes("color")) {
      return defaultVals.current["color"];
    } else if (val.includes("theme")) {
      return defaultVals.current["theme"];
    } else if (val.includes("number")) {
      return defaultVals.current["number"];
    }
    return defaultVals.current["string"];
  }, [defaults, tree, val]);

  React.useEffect(() => {
    callback((prev: any) => setValFromTree(prev, tree, resolvedValue));
  }, []);

  if (val.includes("Array")) {
    return (
      <RenderArrayInput
        fieldKey={fieldKey}
        val={val}
        tree={tree}
        callback={callback}
        resolvedValue={resolvedValue}
      />
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
            defaultValue={resolvedValue}
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
          style={selectStyle}
          defaultValue={resolvedValue}
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
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
        defaultValue={resolvedValue}
        animation={null}
      />
    </div>
  );
}

function RenderArrayInput({
  fieldKey,
  val,
  tree,
  callback,
  resolvedValue,
}: {
  fieldKey: string;
  val: string;
  tree: string;
  callback: (prev: any) => void;
  resolvedValue: any;
}) {
  const [items, setItems] = React.useState<any[]>(() =>
    Array.isArray(resolvedValue) ? resolvedValue : [],
  );

  const commit = (next: any[]) => {
    setItems(next);
    callback((prev: any) => setValFromTree(prev, tree, next));
  };

  return (
    <ArrayEditor
      fieldKey={fieldKey}
      shape={val}
      value={items}
      onChange={commit}
    />
  );
}

function ArrayEditor({
  fieldKey,
  shape,
  value,
  onChange,
}: {
  fieldKey: string;
  shape: string;
  value: any[];
  onChange: (next: any[]) => void;
}) {
  const innerShape = getInnerShape(shape);
  const isMultiTyped = hasTopLevelUnion(innerShape);
  const variants = React.useMemo(() => parseVariants(innerShape), [innerShape]);
  const [newVariant, setNewVariant] = React.useState(0);

  const addItem = () => {
    const variant = variants[newVariant] ?? variants[0];
    if (!variant) return;
    onChange([...value, createItem(variant)]);
  };

  const removeItem = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveItem = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const updateItem = (idx: number, nextItem: any) => {
    onChange(value.map((item, i) => (i === idx ? nextItem : item)));
  };

  const allObjects =
    variants.length > 0 && variants.every((v) => v.kind === "object");

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
            ({allObjects ? "List of Objects" : "List"})
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

      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        {isMultiTyped && (
          <select
            value={newVariant}
            onChange={(e) => setNewVariant(Number(e.target.value))}
            style={{ ...selectStyle, width: "auto" }}
          >
            {variants.map((variant, i) => (
              <option key={i} value={i}>
                {variantLabel(variant, i)}
              </option>
            ))}
          </select>
        )}
        <DyvixButton
          type="button"
          onClick={addItem}
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

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {value.length === 0 && (
          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
            No items yet.
          </div>
        )}

        {value.map((item: any, idx: number) => {
          const variant = variants[matchVariant(item, variants)];
          const summary =
            typeof item?.id === "string" || typeof item?.id === "number"
              ? item.id
              : typeof item?.name === "string"
                ? item.name
                : null;
          const base =
            item && typeof item === "object" && !Array.isArray(item)
              ? item
              : {};

          return (
            <div
              key={idx}
              style={{
                padding: "8px",
                background: "rgba(15, 23, 42, 0.4)",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                fontSize: "0.85rem",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span>
                  Item #{idx + 1}
                  {summary !== null && `: ${summary}`}
                  {isMultiTyped && variant && (
                    <span style={{ color: "#818cf8", fontSize: "0.75rem" }}>
                      {" "}
                      ({variantLabel(variant, matchVariant(item, variants))})
                    </span>
                  )}
                </span>
                <span style={{ display: "flex", gap: "4px" }}>
                  <button
                    type="button"
                    aria-label="Move item up"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, -1)}
                    style={smallButtonStyle}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move item down"
                    disabled={idx === value.length - 1}
                    onClick={() => moveItem(idx, 1)}
                    style={smallButtonStyle}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => removeItem(idx)}
                    style={smallButtonStyle}
                  >
                    ✕
                  </button>
                </span>
              </div>

              {variant?.kind === "object" ? (
                Object.entries(variant.fields).map(([name, type]) => (
                  <FieldInput
                    key={name}
                    label={name}
                    typeString={type}
                    value={base[name]}
                    onChange={(next) =>
                      updateItem(idx, { ...base, [name]: next })
                    }
                  />
                ))
              ) : variant?.kind === "primitive" ? (
                <FieldInput
                  label="value"
                  typeString={variant.type}
                  value={item}
                  onChange={(next) => updateItem(idx, next)}
                />
              ) : (
                <code style={{ fontSize: "0.75rem" }}>
                  {JSON.stringify(item)}
                </code>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FieldInput({
  label,
  typeString,
  value,
  onChange,
}: {
  label: string;
  typeString: string;
  value: any;
  onChange: (next: any) => void;
}) {
  const labelNode = (
    <div style={{ marginBottom: "4px" }}>
      <DyvixLabel animation={null}>
        <span style={{ fontSize: "0.8rem", color: "#cbd5e1", fontWeight: 500 }}>
          {label}
        </span>
      </DyvixLabel>
    </div>
  );

  const literals = parseLiteralUnion(typeString);

  if (literals && literals.length === 1) {
    return (
      <div style={{ margin: "6px 0", fontSize: "0.75rem", color: "#64748b" }}>
        {label}: <code>{literals[0]}</code>
      </div>
    );
  }

  if (literals) {
    return (
      <div style={{ margin: "8px 0" }}>
        {labelNode}
        <select
          value={value ?? literals[0]}
          onChange={(e) => onChange(e.target.value)}
          style={selectStyle}
        >
          {literals.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const kind = getFieldKind(typeString);

  if (kind === "array") {
    return (
      <ArrayEditor
        fieldKey={label}
        shape={typeString}
        value={Array.isArray(value) ? value : []}
        onChange={onChange}
      />
    );
  }

  if (kind === "color") {
    const hex =
      typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
        ? value
        : DEFAULT_VALS.color;

    return (
      <div style={{ margin: "8px 0" }}>
        {labelNode}
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "28px",
            height: "28px",
            border: "none",
            background: "none",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        />
      </div>
    );
  }

  if (kind === "theme") {
    return (
      <div style={{ margin: "8px 0" }}>
        {labelNode}
        <select
          value={value ?? DEFAULT_VALS.theme}
          onChange={(e) => onChange(e.target.value)}
          style={selectStyle}
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  const isNumber = kind === "number";

  return (
    <div style={{ margin: "8px 0" }}>
      {labelNode}
      <DyvixInput
        type={isNumber ? "number" : "text"}
        placeholder={label}
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(isNumber && raw !== "" ? Number(raw) : raw);
        }}
        animation={null}
      />
    </div>
  );
}

function getValFromTree(obj: Record<string, any> | null, tree: string): any {
  if (!obj) return undefined;

  const splitTree = tree.split("-").filter(Boolean);

  const retrieveRecursively = (current: any, index: number): any => {
    if (current === undefined || current === null) return undefined;

    const key = splitTree[index];

    if (Array.isArray(current)) {
      const indexNum = Number(key);
      if (!isNaN(indexNum)) {
        current = current[indexNum];
      } else {
        current = current.find(
          (item) => item && (item.id === key || item.name === key),
        );
      }
      if (!current) return undefined;
    } else if (typeof current === "object") {
      current = current[key];
    } else {
      return undefined;
    }

    if (index === splitTree.length - 1) {
      return current;
    }

    return retrieveRecursively(current, index + 1);
  };

  return retrieveRecursively(obj, 0);
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
