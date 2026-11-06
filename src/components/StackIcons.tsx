import * as icons from "simple-icons";

interface StackIconsProps {
  name: keyof typeof icons | string;
  className?: string;
  size?: number;
}

export default function StackIcons({
  name,
  className = "w-6 h-6",
  size = 16,
}: StackIconsProps) {
  if (name.startsWith("$")) {
    return <span className="text-xs">{name.slice(1)}</span>;
  }

  const iconKey = `si${
    name.charAt(0).toUpperCase() +
    name
      .slice(1)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
  }` as keyof typeof icons;
  const icon = icons[iconKey] as { path: string; hex: string } | undefined;

  if (!icon) {
    return <span className="text-xs">{name}</span>;
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`${className} transition-colors duration-200`}
      fill="currentColor"
    >
      <path d={icon.path} />
    </svg>
  );
}
