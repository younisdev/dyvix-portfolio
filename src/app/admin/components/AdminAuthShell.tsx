"use client";

import React, { useEffect, useState } from "react";
import AdminNav from "./AdminNav";
import { DyvixModal } from "dyvix-ui";

interface AdminAuthShellProps {
  children?: React.ReactNode;
}

export default function AdminAuthShell({ children }: AdminAuthShellProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setAuth] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<"login" | "register">("login");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <AdminNav
        items={
          !isAuthenticated
            ? [
                { label: "Login", onClick: () => setAuthMethod("login") },
                { label: "Register", onClick: () => setAuthMethod("register") },
              ]
            : [{ label: "Home", onClick: () => {} }]
        }
      />
      {!isAuthenticated ? (
        <DyvixModal
          overrides={{
            "--dyvix-modal-backdrop-filter": "blur(8px)",
            "--dyvix-modal-padding": "12px 24px",
            "--dyvix-modal-color": "#f8fafc",
            "--dyvix-modal-letter-spacing": "-0.01em",
            "--dyvix-modal-border-width": "1px",
            "--dyvix-modal-border-style": "solid",
            "--dyvix-modal-border-radius": "8px",
            "--dyvix-modal-transition": "all 0.2s ease-in-out",
            "--dyvix-modal-hover-color": "#ffffff",
            "--dyvix-modal-hover-transform": "translateY(-1px)",
            "--dyvix-modal-hover-border-width": "1px",
            "--dyvix-modal-hover-border-style": "solid",
            "--dyvix-modal-hover-border-radius": "8px",
            "--dyvix-modal-bg": "rgba(15, 23, 42, 0.85)",
            "--dyvix-modal-font-family": "Geist",
            "--dyvix-modal-font-size": "0.9rem",
            "--dyvix-modal-font-weight": "400",
            "--dyvix-modal-border-color": "rgba(255, 255, 255, 0.08)",
            "--dyvix-modal-box-shadow":
              "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
            "--dyvix-modal-hover-bg": "rgba(30, 41, 59, 0.9)",
            "--dyvix-modal-hover-border-color": "rgba(255, 255, 255, 0.18)",
            "--dyvix-modal-hover-box-shadow": "0 4px 12px rgba(0, 0, 0, 0.5)",
            "--dyvix-modal-header-font-family": "Geist",
            "--dyvix-modal-header-font-size": "2rem",
            "--dyvix-modal-header-font-weight": "600",
            "--dyvix-modal-header-color": "#f8fafc",
            "--dyvix-modal-header-transition": "color 0.2s ease-in-out",
            "--dyvix-modal-header-hover-color": "#38bdf8",
            "--dyvix-modal-header-hover-transform": "none",
            "--dyvix-modal-button-font-family": "Geist",
            "--dyvix-modal-button-font-size": "0.875rem",
            "--dyvix-modal-button-font-weight": "500",
            "--dyvix-modal-button-bg": "#38bdf8",
            "--dyvix-modal-button-color": "#0f172a",
            "--dyvix-modal-button-transition": "all 0.15s ease-in-out",
            "--dyvix-modal-button-hover-color": "#ffffff",
            "--dyvix-modal-button-hover-bg": "#0ea5e9",
            "--dyvix-modal-button-hover-transform": "translateY(-1px)",
            "--dyvix-modal-button-active-color": "#ffffff",
            "--dyvix-modal-button-active-bg": "#0284c7",
            "--dyvix-modal-button-active-transform": "scale(0.98)",
            "--dyvix-modal-z-index": "1000",
            "--dyvix-modal-display": "flex",
          }}
          title={authMethod === "login" ? "Login" : "Register"}
          elements={
            authMethod === "login"
              ? [
                  {
                    type: "text",
                    placeholder: "Username",
                    id: "Name",
                    name: "Username",
                    amount: 1,
                  },
                  {
                    type: "password",
                    placeholder: "Password",
                    id: "password",
                    name: "password",
                    amount: 1,
                    validation: "password",
                  },
                ]
              : [
                  {
                    type: "text",
                    placeholder: ["First Name", "Last Name"],
                    id: "Name",
                    name: ["First Name", "Last Name"],
                    amount: 2,
                  },
                  {
                    type: "email",
                    placeholder: "Email Address",
                    validation: "email",
                    id: "email",
                    name: "email",
                    amount: 1,
                  },
                  {
                    type: "password",
                    placeholder: "Password",
                    id: "password",
                    name: "password",
                    amount: 1,
                    validation: "password",
                  },
                ]
          }
        />
      ) : (
        children
      )}
    </>
  );
}
