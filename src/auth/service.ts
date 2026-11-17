import { hashPassword, verifyPassword } from "@/app/utils";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { signAuthToken } from "./jwt";
import { SaveToken } from "./actions";

export async function loginUser(username: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    throw new Error("Invalid username or password.");
  }

  const is_valid = await verifyPassword(password, user.passwordHash);

  if (!is_valid) {
    throw new Error("Invalid username or password.");
  }

  const token = await signAuthToken({
    userID: user.id,
    username: user.username,
  });

  return token;
}
export type DbOrTx =
  typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function registerUser(
  username: string,
  email: string,
  password: string,
  tx: DbOrTx = db,
) {
  const [existingUser] = await tx
    .select()
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .limit(1);

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Email is already registered");
    }
    throw new Error("Username is already taken");
  }

  const hashedpassword = await hashPassword(password);

  const [newUser] = await tx
    .insert(users)
    .values({
      username: username,
      passwordHash: hashedpassword,
      superUser: true,
      email: email,
    })
    .returning();

  const token = await signAuthToken({
    userID: newUser.id,
    username: newUser.username,
  });

  return token;
}
