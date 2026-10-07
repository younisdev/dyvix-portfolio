"use client";

import { DyvixNav } from "dyvix-ui";
interface DyvixConfigItemsProps {
  label: string;
  href?: string;
  onClick?: Function;
}

interface DyvixAdminNav {
  items: DyvixConfigItemsProps[];
}

export default function AdminNav({ items }: DyvixAdminNav) {
  return (
    <DyvixNav
      brand={{ label: "Dyvix Protofolio Admin" }}
      items={items}
      overrides={{
        "--dyvix-nav-display": "inline-flex",
        "--dyvix-nav-gap": "1.5rem",
        "--dyvix-nav-padding": "0.75rem 1.5rem",
        "--dyvix-nav-color": "#f8fafc",
        "--dyvix-nav-font-family": "Geist, system-ui, sans-serif",
        "--dyvix-nav-font-size": "0.875rem",
        "--dyvix-nav-font-weight": "500",
        "--dyvix-nav-border-width": "1px",
        "--dyvix-nav-border-style": "solid",
        "--dyvix-nav-border-radius": "9999px",
        "--dyvix-nav-hover-color": "#ffffff",
        "--dyvix-nav-hover-border-width": "1px",
        "--dyvix-nav-hover-border-style": "solid",
        "--dyvix-nav-hover-border-radius": "9999px",
        "--dyvix-nav-hover-transform": "translateY(-1px)",
        "--dyvix-nav-transition": "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "--dyvix-nav-focus": "rgba(59, 130, 246, 0.5)",
        "--dyvix-nav-border-color": "rgba(255, 255, 255, 0.08)",
        "--dyvix-nav-bg": "rgba(15, 23, 42, 0.75)",
        "--dyvix-nav-box-shadow":
          "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
        "--dyvix-nav-hover-border-color": "rgba(255, 255, 255, 0.18)",
        "--dyvix-nav-hover-bg": "rgba(30, 41, 59, 0.85)",
        "--dyvix-nav-hover-box-shadow":
          "0 25px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)",
        "--dyvix-nav-width": "fit-content",
        "--dyvix-nav-max-width": "1200px",
        "--dyvix-nav-height": "auto",
        "--dyvix-nav-position": "sticky",
        "--dyvix-nav-top": "1.25rem",
        "--dyvix-nav-z-index": 1000,
        "--dyvix-nav-margin": "0 auto",
        "--dyvix-nav-menu-flex-direction": "row",
        "--dyvix-nav-menu-align-items": "center",
        "--dyvix-nav-menu-gap": "1.25rem",
        "--dyvix-nav-menu-padding": "0",
        "--dyvix-nav-brand-color": "#38bdf8",
        "--dyvix-nav-brand-hover-color": "#0ea5e9",
        "--dyvix-nav-link-color": "#94a3b8",
        "--dyvix-nav-link-hover-color": "#f8fafc",
      }}
    />
  );
}
