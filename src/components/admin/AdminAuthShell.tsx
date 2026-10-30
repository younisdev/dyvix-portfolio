"use client";

import React, { useEffect, useState } from "react";
import AdminNav from "./AdminNav";
import { DyvixModal, dyvixToast, DyvixToastContainer } from "dyvix-ui";
import {
  getAuthenticatedUser,
  handleLoginAction,
  handleRegisterAction,
} from "@/auth/actions";

interface AdminAuthShellProps {
  children?: React.ReactNode;
}

const MODAL_OVERRIDES = {
  "--dyvix-modal-backdrop-filter": "blur(8px)",
  "--dyvix-modal-padding": "12px 24px",
  "--dyvix-modal-color": "#f8fafc",
  "--dyvix-modal-letter-spacing": "-0.01em",
  "--dyvix-modal-border-width": "1px",
  "--dyvix-modal-border-style": "solid",
  "--dyvix-modal-border-radius": "8px",
  "--dyvix-modal-transition": "all 0.2s ease-in-out",
  "--dyvix-modal-bg": "rgba(15, 23, 42, 0.85)",
  "--dyvix-modal-font-family": "Geist",
  "--dyvix-modal-header-font-size": "2rem",
  "--dyvix-modal-button-bg": "#38bdf8",
  "--dyvix-modal-button-color": "#0f172a",
  "--dyvix-modal-z-index": "1000",
  "--dyvix-modal-display": "flex",
} as const;

export default function AdminAuthShell({ children }: AdminAuthShellProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setAuth] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [authMethod, setAuthMethod] = useState<"login" | "register">("login");

  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const result = await getAuthenticatedUser();

        if (result) {
          setAuth(true);
        }
      } finally {
        setIsLoadingAuth(false);
      }
    }

    checkExistingAuth();
    setIsMounted(true);
  }, []);
  if (!isMounted || isLoadingAuth) return null;

  async function HandleSubmitData(data: Record<string, any>) {
    const result =
      authMethod === "login"
        ? await handleLoginAction(data["Username"], data["password"])
        : await handleRegisterAction(
            `${data["First Name"]} ${data["Last Name"]}`,
            data["email"],
            data["password"],
          );

    if (result.success) {
      const isValidatedUser = await getAuthenticatedUser();

      if (isValidatedUser) {
        dyvixToast.success(
          authMethod === "login"
            ? "Welcome back!"
            : "Account created successfully!",
        );
        setAuth(true);
      }
    } else {
      dyvixToast.error(result.error);
    }
  }
  return (
    <div style={{ background: "#0b0f17", width: "100vw", height: "100vh" }}>
      <DyvixToastContainer
        position="top-right"
        duration={3000}
        segments={10}
        animation={"glitch"}
      />
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
          onSubmit={(data) => {
            HandleSubmitData(data);
          }}
          overrides={MODAL_OVERRIDES}
          title={authMethod === "login" ? "Login" : "Register"}
          preset={authMethod === "login" ? "Login" : "Register"}
        />
      ) : (
        children
      )}
    </div>
  );
}
