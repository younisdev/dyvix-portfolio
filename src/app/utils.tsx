export function parseMainConfigVars(config: Record<string, any>) {
  const jsonString = JSON.stringify(config);

  const parsedString = jsonString.replace(/\${(\w+)}/g, (_, key) => {
    return config[key] || "";
  });
  return JSON.parse(parsedString);
}

export function parseThemePropertyconfig(
  config: Record<string, any>,
  component: string,
) {
  if (!config || typeof config !== "object") return {};
  let result: Record<string, any> = {};

  Object.entries(config).forEach(([key, val]) => {
    result[`--dyvix-${component}-${key}`] = val;
  });

  return result;
}
