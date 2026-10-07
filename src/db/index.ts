import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalDB = globalThis as unknown as {
  con: postgres.Sql | undefined;
};

const con = globalDB.con ?? postgres(process.env.DATABASE_URL!);

if (process.env.NODE_ENV !== "production") globalDB.con = con;

export const db = drizzle(con, { schema });
