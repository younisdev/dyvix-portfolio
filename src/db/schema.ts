import {
  uuid,
  text,
  timestamp,
  boolean,
  pgTable,
  jsonb,
} from "drizzle-orm/pg-core";

export const configProfiles = pgTable("configProfiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileName: text("profile_name").notNull().unique(),
  description: text("description"),
  contentConfig: jsonb("content_config").notNull().default({}),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ConfigProfiles = typeof configProfiles.$inferSelect;
export type NewConfigProfiles = typeof configProfiles.$inferInsert;
