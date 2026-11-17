import { error } from "console";
import { getAuthenticatedUser } from "./actions";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function RequireOwner() {
  const session = await getAuthenticatedUser();

  if (!session) throw new Error("Unauthorized");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userID as string))
    .limit(1);

  if (!user.superUser) throw new Error("Forbidden");

  return user;
}
