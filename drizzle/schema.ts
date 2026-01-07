import { pgTable, text, timestamp, varchar, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  openId: varchar("open_id", { length: 255 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  image: text("image"),
  provider: text("provider"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const quranBookmarks = pgTable("quran_bookmarks", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  surahNumber: integer("surah_id").notNull(),
  ayahNumber: integer("ayah_id").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  contentId: text("content_id").notNull(),
  title: text("title"),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasbeehCounter = pgTable("tasbeeh_counter", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  count: integer("count").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const worshipTracking = pgTable("worship_tracking", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: text("date").notNull(),
  fajr: integer("fajr").default(0).notNull(),
  dhuhr: integer("dhuhr").default(0).notNull(),
  asr: integer("asr").default(0).notNull(),
  maghrib: integer("maghrib").default(0).notNull(),
  isha: integer("isha").default(0).notNull(),
  quranReading: integer("quran_reading").default(0).notNull(),
  adhkar: integer("adhkar").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  prayerNotifications: integer("prayer_notifications").default(1).notNull(),
  notificationMinutesBefore: integer("notification_minutes_before").default(15).notNull(),
  preferredQuranReciter: varchar("preferred_quran_reciter", { length: 100 }).default("ar.alafasy"),
  reciterId: varchar("reciter_id", { length: 100 }).default("ar.alafasy"),
  theme: text("theme").default("light").notNull(),
  language: varchar("language", { length: 10 }).default("ar"),
  country: varchar("country", { length: 100 }).default("Iraq"),
  city: varchar("city", { length: 100 }).default("Baghdad"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  athanEnabled: boolean("athan_enabled").default(false),
  preNotificationEnabled: boolean("pre_notification_enabled").default(true),
  calculationMethod: integer("calculation_method").default(4),
  preNotificationTime: integer("pre_notification_time").default(5),
  athanVoice: text("athan_voice").default("makkah"),
  fajrEnabled: boolean("fajr_enabled").default(true),
  dhuhrEnabled: boolean("dhuhr_enabled").default(true),
  asrEnabled: boolean("asr_enabled").default(true),
  maghribEnabled: boolean("maghrib_enabled").default(true),
  ishaEnabled: boolean("isha_enabled").default(true),
  sunnahTahajjud: boolean("sunnah_tahajjud").default(false),
  sunnahDuha: boolean("sunnah_duha").default(false),
  sunnahWitr: boolean("sunnah_witr").default(false),
  dndModeEnabled: boolean("dnd_mode_enabled").default(false),
  dndStart: varchar("dnd_start", { length: 10 }).default("22:00"),
  dndEnd: varchar("dnd_end", { length: 10 }).default("04:00"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const readingProgress = pgTable("reading_progress", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: text("title").notNull(),
  author: text("author"),
  category: text("category").notNull(), // e.g. 'sunni', 'shia', 'general'
  description: text("description"),
  coverUrl: text("cover_url"),
  fileUrl: text("file_url").notNull(),
  isFeatured: integer("is_featured").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type QuranBookmark = typeof quranBookmarks.$inferSelect;
export type InsertQuranBookmark = typeof quranBookmarks.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
export type TasbeehCounter = typeof tasbeehCounter.$inferSelect;
export type InsertTasbeehCounter = typeof tasbeehCounter.$inferInsert;
export type WorshipTracking = typeof worshipTracking.$inferSelect;
export type InsertWorshipTracking = typeof worshipTracking.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = typeof readingProgress.$inferInsert;
export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

export const adhkar = pgTable("adhkar", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  category: varchar("category", { length: 100 }).notNull(),
  content: text("content").notNull(),
  title: text("title"),
  source: varchar("source", { length: 255 }),
  type: varchar("type", { length: 50 }).notNull(), // 'adhkar', 'duaa', or 'ziyarat'
  orderIndex: integer("order_index").default(1),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Adhkar = typeof adhkar.$inferSelect;
export type InsertAdhkar = typeof adhkar.$inferInsert;