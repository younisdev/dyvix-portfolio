"use client";

import { deleteToken } from "@/auth/actions";
import { useRouter } from "next/navigation";
import React from "react";

export default function Logout() {
  const router = useRouter();

  React.useEffect(() => {
    async function handleLogout() {
      await deleteToken();
      router.push("/admin");
      router.refresh();
    }

    handleLogout();
  }, [router]);

  return <p>Logging out...</p>;
}
