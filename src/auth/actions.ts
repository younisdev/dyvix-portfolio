"use server";

import { cookies } from "next/headers";
import { DbOrTx, loginUser, registerUser } from "./service";
import { verifyAuthToken } from "./jwt";
import { db } from "@/db";
import { users } from "@/db/schema";
import { RequireOwner } from "./guard";

export async function handleLoginAction(username: string, password: string) {
  try {
    const result = await loginUser(username, password);
    await SaveToken(result, username);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Invalid usernam or password" };
  }
}

export async function handleRegisterAction(
  username: string,
  email: string,
  password: string,
) {
  try {
    const token = await db.transaction(async (tx) => {
      if (await hasOwner(tx)) throw new Error("Access denied!");
      return await registerUser(username, email, password, tx);
    });

    await SaveToken(token, username);

    return { success: true };
  } catch (error: any) {
    if (error?.message === "Access denied!" || error?.code === "23505") {
      return { success: false, error: "Access denied!" };
    }

    return {
      success: false,
      error: "Registration failed.",
    };
  }
}

export async function handleCreateUserAction(
  username: string,
  email: string,
  password: string,
) {
  try {
    await RequireOwner();

    await db.transaction(async (tx) => {
      await registerUser(username, email, password, tx);
    });

    return { success: true };
  } catch (error: any) {
    if (error?.code === "23505") {
      return { success: false, error: "Username or email already exists." };
    }

    if (error?.message === "Access denied!") {
      return { success: false, error: "Access denied!" };
    }

    return {
      success: false,
      error: "Failed to create user.",
    };
  }
}

export async function SaveToken(token: string, username: string) {
  const cookieStore = await cookies();

  cookieStore.set("dyvix-token", JSON.stringify({ username, token }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("dyvix-token")?.value;
}

export async function deleteToken() {
  const cookieStore = await cookies();

  cookieStore.delete("dyvix-token");
}

export async function getAuthenticatedUser() {
  try {
    const tokenCookie = await getToken();

    if (!tokenCookie) return null;

    const { token } = JSON.parse(tokenCookie);
    const payload = await verifyAuthToken(token);

    return payload;
  } catch {
    return null;
  }
}

export async function hasOwner(tx: DbOrTx = db) {
  try {
    const [existingUsers] = await tx.select().from(users).limit(1);
    return !!existingUsers;
  } catch (error) {
    console.error("Database check failed, failing closed:", error);
    return true;
  }
}
