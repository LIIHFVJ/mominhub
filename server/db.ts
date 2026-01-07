import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, type InsertUser, favorites, tasbeehCounter, worshipTracking, userPreferences, adhkar, type Adhkar } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const values = { ...user };
    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.id,
      set: {
        ...values,
        updatedAt: new Date(),
      }
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Favorites queries
export async function addFavorite(userId: string, type: string, contentId: string, title?: string, content?: string) {
  const db = await getDb();
  if (!db) return undefined;

  return db.insert(favorites).values({
    userId,
    type,
    contentId,
    title,
    content,
  });
}

export async function removeFavorite(userId: string, contentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  return db.delete(favorites).where(
    eq(favorites.userId, userId)
  );
}

export async function getFavorites(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(favorites).where(eq(favorites.userId, userId));
}

// Tasbeeh Counter queries
export async function getTasbeehCounter(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tasbeehCounter).where(eq(tasbeehCounter.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTasbeehCount(userId: string, count: number) {
  const db = await getDb();
  if (!db) return undefined;

  return db.insert(tasbeehCounter).values({ userId, count }).onConflictDoUpdate({
    target: tasbeehCounter.userId,
    set: { count, updatedAt: new Date() }
  });
}

// Worship Tracking queries
export async function getWorshipTracking(userId: string, date: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(worshipTracking).where(
    eq(worshipTracking.userId, userId)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateWorshipTracking(userId: string, date: string, updates: any) {
  const db = await getDb();
  if (!db) return undefined;

  return db.insert(worshipTracking).values({ userId, date, ...updates }).onConflictDoUpdate({
    target: worshipTracking.userId,
    set: { ...updates, updatedAt: new Date() }
  });
}

// User Preferences queries
export async function getUserPreferences(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPreferences(userId: string, updates: any) {
  const db = await getDb();
  if (!db) return undefined;

  return db.insert(userPreferences).values({ userId, ...updates }).onConflictDoUpdate({
    target: userPreferences.userId,
    set: { ...updates, updatedAt: new Date() }
  });
}

// Adhkar queries
export async function getAdhkar(userId?: string, category?: string, type?: string): Promise<Adhkar[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select({
    id: adhkar.id,
    category: adhkar.category,
    content: adhkar.content,
    title: adhkar.title,
    source: adhkar.source,
    type: adhkar.type,
    orderIndex: adhkar.orderIndex,
    isActive: adhkar.isActive,
    createdAt: adhkar.createdAt,
    updatedAt: adhkar.updatedAt
  }).from(adhkar);
  
  // Only return active adhkar
  query = query.where(eq(adhkar.isActive, true));
  
  if (category) {
    query = query.where(eq(adhkar.category, category));
  }
  
  if (type) {
    query = query.where(eq(adhkar.type, type));
  }

  const results = await query.limit(200).execute();
  return results;
}
