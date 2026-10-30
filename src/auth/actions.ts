"use server";

import { cookies } from "next/headers";
import { loginUser, registerUser } from "./service";
import { verifyAuthToken } from "./jwt";

export async function handleLoginAction(username: string, password: string) {
  try {
    const result = await loginUser(username, password);
    await SaveToken(result, username);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function handleRegisterAction(
  username: string,
  email: string,
  password: string,
) {
  try {
    const result = await registerUser(username, email, password);
    await SaveToken(result, username);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
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
  const tokenCookie = await getToken();

  if (!tokenCookie) return null;

  const { token } = JSON.parse(tokenCookie);
  const payload = await verifyAuthToken(token);

  return payload;
}
