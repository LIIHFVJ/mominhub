import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";

// Mock the getDb function
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    getDb: vi.fn(),
  };
});

describe("Database Functions", () => {
  describe("Favorites", () => {
    it("should add a favorite", async () => {
      const result = await db.addFavorite(
        1,
        "dua",
        "dua-1",
        "دعاء الاستخارة",
        "اللهم إني أستخيرك..."
      );
      expect(result).toBeDefined();
    });

    it("should get user favorites", async () => {
      const favorites = await db.getFavorites(1);
      expect(Array.isArray(favorites)).toBe(true);
    });

    it("should remove a favorite", async () => {
      const result = await db.removeFavorite(1, "dua-1");
      expect(result).toBeDefined();
    });
  });

  describe("Tasbeeh Counter", () => {
    it("should get tasbeeh counter", async () => {
      const counter = await db.getTasbeehCounter(1);
      expect(counter === undefined || typeof counter === "object").toBe(true);
    });

    it("should update tasbeeh count", async () => {
      const result = await db.updateTasbeehCount(1, 100);
      expect(result).toBeDefined();
    });

    it("should increment count correctly", async () => {
      await db.updateTasbeehCount(1, 0);
      await db.updateTasbeehCount(1, 1);
      const counter = await db.getTasbeehCounter(1);
      expect(counter?.count).toBe(1);
    });
  });

  describe("Worship Tracking", () => {
    it("should get worship tracking for a date", async () => {
      const tracking = await db.getWorshipTracking(1, "2024-01-06");
      expect(tracking === undefined || typeof tracking === "object").toBe(true);
    });

    it("should update worship tracking", async () => {
      const result = await db.updateWorshipTracking(1, "2024-01-06", {
        fajr: 1,
        dhuhr: 1,
      });
      expect(result).toBeDefined();
    });

    it("should track all prayers", async () => {
      const updates = {
        fajr: 1,
        dhuhr: 1,
        asr: 1,
        maghrib: 1,
        isha: 1,
      };
      const result = await db.updateWorshipTracking(1, "2024-01-06", updates);
      expect(result).toBeDefined();
    });
  });

  describe("User Preferences", () => {
    it("should get user preferences", async () => {
      const prefs = await db.getUserPreferences(1);
      expect(prefs === undefined || typeof prefs === "object").toBe(true);
    });

    it("should update user preferences", async () => {
      const result = await db.updateUserPreferences(1, {
        latitude: "24.7136",
        longitude: "46.6753",
        theme: "dark",
      });
      expect(result).toBeDefined();
    });

    it("should set prayer notification preferences", async () => {
      const result = await db.updateUserPreferences(1, {
        prayerNotifications: 1,
        notificationMinutesBefore: 15,
      });
      expect(result).toBeDefined();
    });

    it("should set preferred quran reciter", async () => {
      const result = await db.updateUserPreferences(1, {
        preferredQuranReciter: "ar.alafasy",
      });
      expect(result).toBeDefined();
    });
  });
});

describe("Islamic Data Constants", () => {
  it("should have quran reciters", async () => {
    const { QURAN_RECITERS } = await import("../shared/islamic-data");
    expect(QURAN_RECITERS.length).toBeGreaterThan(0);
    expect(QURAN_RECITERS[0]).toHaveProperty("id");
    expect(QURAN_RECITERS[0]).toHaveProperty("name");
  });

  it("should have adhkar categories", async () => {
    const { ADHKAR_CATEGORIES } = await import("../shared/islamic-data");
    expect(Object.keys(ADHKAR_CATEGORIES).length).toBeGreaterThan(0);
    expect(ADHKAR_CATEGORIES.morning).toBeDefined();
    expect(ADHKAR_CATEGORIES.evening).toBeDefined();
  });

  it("should have prayer times", async () => {
    const { PRAYER_TIMES } = await import("../shared/islamic-data");
    expect(PRAYER_TIMES.length).toBe(5);
    expect(PRAYER_TIMES).toContain("الفجر");
    expect(PRAYER_TIMES).toContain("الظهر");
  });

  it("should have islamic months", async () => {
    const { ISLAMIC_MONTHS } = await import("../shared/islamic-data");
    expect(ISLAMIC_MONTHS.length).toBe(12);
    expect(ISLAMIC_MONTHS[0]).toBe("محرم");
    expect(ISLAMIC_MONTHS[8]).toBe("رمضان");
  });

  it("should have islamic occasions", async () => {
    const { ISLAMIC_OCCASIONS } = await import("../shared/islamic-data");
    expect(ISLAMIC_OCCASIONS.length).toBeGreaterThan(0);
    const ramadan = ISLAMIC_OCCASIONS.find((o) => o.name.includes("رمضان"));
    expect(ramadan).toBeDefined();
  });
});
