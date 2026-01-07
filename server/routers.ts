import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  favorites: router({
    list: protectedProcedure.query(({ ctx }) =>
      db.getFavorites(ctx.user.id)
    ),
    add: protectedProcedure
      .input(z.object({
        type: z.enum(["dua", "verse", "book", "adhkar"]),
        contentId: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(({ ctx, input }) =>
        db.addFavorite(ctx.user.id, input.type, input.contentId, input.title, input.content)
      ),
    remove: protectedProcedure
      .input(z.object({ contentId: z.string() }))
      .mutation(({ ctx, input }) =>
        db.removeFavorite(ctx.user.id, input.contentId)
      ),
  }),

  tasbeeh: router({
    get: protectedProcedure.query(({ ctx }) =>
      db.getTasbeehCounter(ctx.user.id)
    ),
    update: protectedProcedure
      .input(z.object({ count: z.number() }))
      .mutation(({ ctx, input }) =>
        db.updateTasbeehCount(ctx.user.id, input.count)
      ),
  }),

  worship: router({
    get: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(({ ctx, input }) =>
        db.getWorshipTracking(ctx.user.id, input.date)
      ),
    update: protectedProcedure
      .input(z.object({
        date: z.string(),
        fajr: z.number().optional(),
        dhuhr: z.number().optional(),
        asr: z.number().optional(),
        maghrib: z.number().optional(),
        isha: z.number().optional(),
        quranReading: z.number().optional(),
        adhkar: z.number().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const { date, ...updates } = input;
        return db.updateWorshipTracking(ctx.user.id, date, updates);
      }),
  }),

  preferences: router({
    get: protectedProcedure.query(({ ctx }) =>
      db.getUserPreferences(ctx.user.id)
    ),
    update: protectedProcedure
      .input(z.object({
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        prayerNotifications: z.number().optional(),
        notificationMinutesBefore: z.number().optional(),
        preferredQuranReciter: z.string().optional(),
        theme: z.enum(["light", "dark"]).optional(),
      }))
      .mutation(({ ctx, input }) =>
        db.updateUserPreferences(ctx.user.id, input)
      ),
  }),

  fatwa: router({
    ask: protectedProcedure
      .input(z.object({
        question: z.string(),
        context: z.enum(['sunni', 'shia']).optional(),
      }))
      .mutation(async ({ input }) => {
        const { askGemini } = await import("./services/gemini");
        const answer = await askGemini(input.question, input.context);
        return { answer };
      }),
  }),

  adhkar: router({
    get: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        type: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        let query = db.select().from(db.schema.adhkar);
        
        if (input.category) {
          query = query.where(eq(db.schema.adhkar.category, input.category));
        }
        
        if (input.type) {
          query = query.where(eq(db.schema.adhkar.type, input.type));
        }

        const results = await query.limit(200).execute();
        return results;
      }),
  }),
});

export type AppRouter = typeof appRouter;
